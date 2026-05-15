// v1.0 - Markdown Question Parser
// Parses markdown content to extract questions in various formats

import { generateId } from "@elzatona/utilities";
import { removeAllHTMLTags } from "./sanitize-server";
import type { BulkQuestionData } from "./unified-question-schema";

export interface MarkdownQuestion {
  title: string;
  content: string;
  type: "single" | "multiple";
  difficulty: "easy" | "medium" | "hard";
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswers: string[];
  explanation?: string;
  category?: string; // Made optional
  learningPath?: string; // Added learning path
  topic?: string; // Added topic field
  tags?: string[];
  points?: number;
}

export interface ParseResult {
  questions: MarkdownQuestion[];
  errors: string[];
  warnings: string[];
}

export class MarkdownQuestionParser {
  private static readonly QUESTION_PATTERNS = {
    // GitHub-style multiple choice with code blocks and options
    multipleChoice:
      /^#{1,6}\s*(\d+)\.?\s*([^\n]*)\n```[^`]*```\n((?:-?\s*[A-Z]:\s*[^\n]*\n)+)/gm,
    // Simple multiple choice format
    simpleMultipleChoice:
      /^(\d+\.?\s*[^\n]*)\n((?:[a-zA-Z]\)\s*[^\n]*(?:\n|$))+)/gm,
    // True/False questions
    trueFalse:
      /^#{1,6}\s*(\d+)\.?\s*([^\n]*)\n```[^`]*```\n-?\s*(True|False)\s*\[(?:correct|x|✓)\]/gm,
    // Open-ended questions
    openEnded:
      /^#{1,6}\s*(\d+)\.?\s*([^\n]*)\n```[^`]*```\n(?:Answer:\s*([^\n]*))?$/gm,
  };

  private static readonly OPTION_PATTERN =
    /^([a-zA-Z])\)\s*([^\n]*?)(?:\s*\[(?:correct|x|✓)\])?$/gm;

  /**
   * Parse markdown content to extract questions
   */
  static parseMarkdown(markdown: string): ParseResult {
    console.log(
      "🔍 MarkdownQuestionParser.parseMarkdown called with:",
      markdown.substring(0, 100) + "...",
    );

    const result: ParseResult = {
      questions: [],
      errors: [],
      warnings: [],
    };

    try {
      // Split content into sections
      const sections = this.splitIntoSections(markdown);
      console.log("📄 Sections found:", sections.length);
      sections.forEach((section, index) => {
        console.log(`Section ${index + 1}:`, section.substring(0, 100) + "...");
      });

      for (const section of sections) {
        const questions = this.parseSection(section);
        console.log(`📝 Questions found in section:`, questions.length);
        result.questions.push(...questions);
      }

      console.log("📊 Total questions found:", result.questions.length);

      // Validate questions
      this.validateQuestions(result.questions, result.errors, result.warnings);
    } catch (error) {
      console.error("❌ Parse error:", error);
      result.errors.push(
        `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    console.log("📤 Returning result:", {
      questionsCount: result.questions.length,
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length,
    });

    return result;
  }

  /**
   * Split markdown content into question sections
   */
  private static splitIntoSections(markdown: string): string[] {
    // Try GitHub-style format first (with headers)
    const githubSections = markdown.split(/(?=^#{1,6}\s*\d+\.)/gm);
    if (githubSections.length > 1) {
      return githubSections.filter((section) => section.trim().length > 0);
    }

    // Fallback to simple format
    const questionSections = markdown.split(/(?=^\d+\.)/gm);
    return questionSections.filter((section) => section.trim().length > 0);
  }

  /**
   * Parse a single section for questions
   */
  private static parseSection(section: string): MarkdownQuestion[] {
    const questions: MarkdownQuestion[] = [];

    // Try different question formats
    const multipleChoiceQuestions = this.parseMultipleChoice(section);
    const trueFalseQuestions = this.parseTrueFalse(section);
    const openEndedQuestions = this.parseOpenEnded(section);

    questions.push(
      ...multipleChoiceQuestions,
      ...trueFalseQuestions,
      ...openEndedQuestions,
    );

    return questions;
  }

  /**
   * Parse multiple choice questions
   */
  private static parseMultipleChoice(section: string): MarkdownQuestion[] {
    const githubQuestions = this.parseGithubStyleMultipleChoice(section);
    if (githubQuestions.length > 0) {
      return githubQuestions;
    }

    return this.parseSimpleMultipleChoice(section);
  }

  private static parseGithubStyleMultipleChoice(
    section: string,
  ): MarkdownQuestion[] {
    const questions: MarkdownQuestion[] = [];
    const githubSections = section
      .split(/(?=^#{1,6}\s*\d+\.)/gm)
      .filter((block) => block.trim());

    for (const block of githubSections) {
      const parsedBlock = this.parseGithubMultipleChoiceBlock(block);
      if (!parsedBlock) {
        continue;
      }

      const question = this.buildMultipleChoiceQuestion(
        parsedBlock.questionText,
        parsedBlock.options,
        block,
      );

      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  private static parseSimpleMultipleChoice(
    section: string,
  ): MarkdownQuestion[] {
    const questions: MarkdownQuestion[] = [];
    const questionBlocks = section
      .split(/(?=^\d+\.)/gm)
      .filter((block) => block.trim());

    for (const block of questionBlocks) {
      const lines = block.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        continue;
      }

      const questionText = lines[0].trim();
      if (!/^\d+\./.exec(questionText)) {
        continue;
      }

      const optionLines = lines.filter((line) =>
        /^[a-zA-Z]\)\s/.exec(line.trim()),
      );
      if (optionLines.length < 2) {
        continue;
      }

      const options = this.parseOptions(optionLines.join("\n"));
      const question = this.buildMultipleChoiceQuestion(
        questionText,
        options,
        block,
      );

      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  private static parseGithubMultipleChoiceBlock(block: string): {
    questionText: string;
    options: MarkdownQuestion["options"];
  } | null {
    const lines = block.split("\n");
    const { questionText, optionsText, correctAnswer } =
      this.extractGithubBlockData(lines);

    if (!questionText || !optionsText) {
      return null;
    }

    const options = this.parseOptions(optionsText, correctAnswer);
    if (options.length < 2) {
      return null;
    }

    return { questionText, options };
  }

  private static extractGithubBlockData(lines: string[]): {
    questionText: string;
    optionsText: string;
    correctAnswer: string;
  } {
    let questionText = "";
    let optionsText = "";
    let inCodeBlock = false;
    let correctAnswer = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const result = this.processGithubBlockLine(line, lines, i, inCodeBlock);

      inCodeBlock = result.inCodeBlock;

      if (result.questionText) {
        questionText = result.questionText;
      }
      if (result.optionLine) {
        optionsText += `${result.optionLine}\n`;
      }
      if (result.correctAnswer) {
        correctAnswer = result.correctAnswer;
      }
    }

    return { questionText, optionsText, correctAnswer };
  }

  private static processGithubBlockLine(
    line: string,
    lines: string[],
    index: number,
    inCodeBlock: boolean,
  ): {
    inCodeBlock: boolean;
    questionText?: string;
    optionLine?: string;
    correctAnswer?: string;
  } {
    if (/^#{1,6}\s*\d+\./.exec(line)) {
      return {
        inCodeBlock,
        questionText: line.replace(/^#{1,6}\s*\d+\.?\s*/, "").trim(),
      };
    }

    if (line.startsWith("```")) {
      return { inCodeBlock: !inCodeBlock };
    }

    if (inCodeBlock) {
      return { inCodeBlock };
    }

    const optionLine = /^-?\s*[A-Z]:\s*/.exec(line) ? line : undefined;
    const inlineCorrectAnswer = this.extractAnswerFromLine(line) ?? undefined;

    if (line.includes("<details>") || line.includes("<summary>")) {
      const lookaheadAnswer = this.extractAnswerFromLookahead(lines, index);
      return {
        inCodeBlock,
        optionLine,
        correctAnswer: lookaheadAnswer ?? inlineCorrectAnswer,
      };
    }

    return {
      inCodeBlock,
      optionLine,
      correctAnswer: inlineCorrectAnswer,
    };
  }

  private static extractAnswerFromLine(line: string): string | null {
    if (!line.includes("Answer:") && !line.includes("**Answer:")) {
      return null;
    }

    const answerMatch = /Answer:\s*([A-D])/i.exec(line);
    if (!answerMatch) {
      return null;
    }

    return answerMatch[1].toLowerCase();
  }

  private static extractAnswerFromLookahead(
    lines: string[],
    startIndex: number,
  ): string | null {
    for (let j = startIndex; j < Math.min(startIndex + 10, lines.length); j++) {
      const answerLine = lines[j].trim();
      const answer = this.extractAnswerFromLine(answerLine);
      if (answer) {
        return answer;
      }
    }

    return null;
  }

  private static buildMultipleChoiceQuestion(
    questionText: string,
    options: MarkdownQuestion["options"],
    block: string,
  ): MarkdownQuestion | null {
    if (options.length < 2) {
      return null;
    }

    const correctAnswers = options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    if (correctAnswers.length === 0) {
      return null;
    }

    return {
      title: this.extractTitle(questionText),
      content: questionText,
      type: correctAnswers.length === 1 ? "single" : "multiple",
      difficulty: this.extractDifficulty(questionText),
      options,
      correctAnswers,
      explanation: this.extractExplanation(block),
      category: this.extractCategory(block),
      learningPath: this.extractLearningPath(block),
      topic: this.extractTopic(block),
      tags: this.extractTags(block),
      points: this.extractPoints(questionText),
    };
  }

  /**
   * Parse true/false questions
   */
  private static parseTrueFalse(section: string): MarkdownQuestion[] {
    const questions: MarkdownQuestion[] = [];
    const lines = section.split("\n").filter((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!/^\d+\./.exec(line)) continue;

      const nextLine = lines[i + 1]?.trim();
      if (!nextLine || !/^(True|False|T|F)$/i.exec(nextLine)) continue;

      const isTrue = /^(True|T)$/i.test(nextLine);

      questions.push({
        title: this.extractTitle(line),
        content: line,
        type: "single",
        difficulty: this.extractDifficulty(line),
        options: [
          { id: "a", text: "True", isCorrect: isTrue },
          { id: "b", text: "False", isCorrect: !isTrue },
        ],
        correctAnswers: [isTrue ? "a" : "b"],
        explanation: this.extractExplanation(section),
        category: this.extractCategory(section),
        learningPath: this.extractLearningPath(section),
        topic: this.extractTopic(section),
        tags: this.extractTags(section),
        points: this.extractPoints(line),
      });
    }

    return questions;
  }

  /**
   * Parse open-ended questions
   */
  private static parseOpenEnded(section: string): MarkdownQuestion[] {
    const questions: MarkdownQuestion[] = [];
    const lines = section.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      if (!/^\d+\./.exec(line)) continue;
      if (/(?:True|False|T|F)$/i.exec(line)) continue; // Skip T/F questions
      if (!/(?:Explain|Describe|What|How|Why)/i.exec(line)) continue;

      questions.push({
        title: this.extractTitle(line),
        content: line,
        type: "single",
        difficulty: this.extractDifficulty(line),
        options: [{ id: "a", text: "Open-ended response", isCorrect: true }],
        correctAnswers: ["a"],
        explanation: this.extractExplanation(section),
        category: this.extractCategory(section),
        learningPath: this.extractLearningPath(section),
        topic: this.extractTopic(section),
        tags: this.extractTags(section),
        points: this.extractPoints(line),
      });
    }

    return questions;
  }

  /**
   * Parse options from text
   */
  private static parseOptions(
    optionsText: string,
    correctAnswer?: string,
  ): Array<{ id: string; text: string; isCorrect: boolean }> {
    const options: Array<{ id: string; text: string; isCorrect: boolean }> = [];

    // Try GitHub-style format first (- A: text)
    const githubPattern = /^-?\s*([A-Z]):\s*(.*?)$/gm;
    let githubMatch = githubPattern.exec(optionsText);

    if (githubMatch) {
      while (githubMatch) {
        const match = githubMatch;
        const id = match[1].toLowerCase();
        const text = match[2].trim();
        const isCorrect = correctAnswer
          ? id === correctAnswer.toLowerCase()
          : text.includes("[correct]") ||
            text.includes("[x]") ||
            text.includes("[✓]") ||
            text.includes("**Answer:") ||
            text.includes("Answer:");

        options.push({ id, text, isCorrect });
        githubMatch = githubPattern.exec(optionsText);
      }
      return options;
    }

    // Fallback to simple format (a) text)
    const optionPattern = new RegExp(
      this.OPTION_PATTERN.source,
      this.OPTION_PATTERN.flags,
    );
    let match = optionPattern.exec(optionsText);

    while (match) {
      const id = match[1].toLowerCase();
      const text = match[2].trim();
      const isCorrect = correctAnswer
        ? id === correctAnswer.toLowerCase()
        : match[0].includes("[correct]") ||
          match[0].includes("[x]") ||
          match[0].includes("[✓]");

      options.push({ id, text, isCorrect });
      match = optionPattern.exec(optionsText);
    }

    return options;
  }

  /**
   * Extract title from question text
   */
  private static extractTitle(questionText: string): string {
    // Remove GitHub-style headers and question numbers
    let title = questionText.replace(/^#{1,6}\s*\d+\.?\s*/, "").trim();
    title = title.replace(/^\d+\.?\s*/, "").trim();
    return title.length > 100 ? title.substring(0, 100) + "..." : title;
  }

  /**
   * Extract difficulty from question text or section
   */
  private static extractDifficulty(text: string): "easy" | "medium" | "hard" {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("easy") || lowerText.includes("beginner"))
      return "easy";
    if (lowerText.includes("hard") || lowerText.includes("advanced"))
      return "hard";
    return "medium";
  }

  /**
   * Extract explanation from section
   */
  private static extractExplanation(section: string): string | undefined {
    // First try to extract from HTML details/summary sections
    const detailsMatch =
      /<details>[^<]*(?:<(?!\/details>)[^<]*)*<\/details>/i.exec(section);
    if (detailsMatch) {
      // Extract content between <p> tags, removing HTML tags
      const pMatch = /<p>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/i.exec(
        detailsMatch[0],
      );
      if (pMatch) {
        // Use comprehensive HTML tag removal function
        const cleaned = removeAllHTMLTags(pMatch[1]);
        return cleaned
          .replaceAll("\n\n", "\n") // Clean up extra whitespace
          .trim();
      }
    }
    // Fallback to simple explanation format
    const explanationMatch = /explanation:\s*([^\n]*)(?:\n|$)/i.exec(section);
    return explanationMatch ? explanationMatch[1].trim() : undefined;
  }

  /**
   * Extract category from section
   */
  private static extractCategory(section: string): string | undefined {
    const categoryMatch = /category:\s*([^\n]*)(?:\n|$)/i.exec(section);
    return categoryMatch ? categoryMatch[1].trim() : undefined;
  }

  /**
   * Extract learning path from section
   */
  private static extractLearningPath(section: string): string | undefined {
    const learningPathMatch =
      /(?:learning[_ ]?path|learningpath):\s*([^\n]*)(?:\n|$)/i.exec(section);
    return learningPathMatch ? learningPathMatch[1].trim() : undefined;
  }

  /**
   * Extract topic from section
   */
  private static extractTopic(section: string): string | undefined {
    const topicMatch = /topic:\s*([^\n]*)(?:\n|$)/i.exec(section);
    if (!topicMatch) {
      return undefined;
    }
    return topicMatch[1].trim();
  }

  /**
   * Extract tags from section
   */
  private static extractTags(section: string): string[] {
    const tagMatches = section.match(/#(\w+)/g);
    return tagMatches ? tagMatches.map((tag) => tag.substring(1)) : [];
  }

  /**
   * Extract points from question text
   */
  private static extractPoints(text: string): number {
    const pointsMatch = /\[(\d+)\s*points?\]/i.exec(text);
    return pointsMatch ? Number.parseInt(pointsMatch[1], 10) : 1;
  }

  /**
   * Validate parsed questions
   */
  private static validateQuestions(
    questions: MarkdownQuestion[],
    errors: string[],
    warnings: string[],
  ): void {
    questions.forEach((question, index) => {
      // Check required fields
      if (!question.title || !question.content) {
        errors.push(`Question ${index + 1}: Missing title or content`);
      }

      if (question.options.length < 2) {
        errors.push(`Question ${index + 1}: Must have at least 2 options`);
      }

      if (question.correctAnswers.length === 0) {
        errors.push(
          `Question ${index + 1}: Must have at least one correct answer`,
        );
      }

      // Check for valid option IDs
      const validIds = new Set(question.options.map((opt) => opt.id));
      const invalidAnswers = question.correctAnswers.filter(
        (id) => !validIds.has(id),
      );
      if (invalidAnswers.length > 0) {
        errors.push(
          `Question ${index + 1}: Invalid correct answer IDs: ${invalidAnswers.join(", ")}`,
        );
      }

      // Warnings
      if (question.title.length > 200) {
        warnings.push(
          `Question ${index + 1}: Title is very long (${question.title.length} characters)`,
        );
      }

      if (question.content.length > 1000) {
        warnings.push(
          `Question ${index + 1}: Content is very long (${question.content.length} characters)`,
        );
      }
    });
  }

  /**
   * Convert parsed questions to BulkQuestionData format
   */
  static convertToBulkData(questions: MarkdownQuestion[]): BulkQuestionData {
    const unifiedQuestions = questions.map((question) => {
      let type: "multiple-choice" | "true-false" | "code" | "mcq";
      if (question.type === "single" || question.type === "multiple") {
        type = "multiple-choice";
      } else if (question.type === "code") {
        type = "code";
      } else {
        type = "mcq";
      }
      let difficulty: "beginner" | "intermediate" | "advanced";
      if (question.difficulty === "easy") {
        difficulty = "beginner";
      } else if (question.difficulty === "medium") {
        difficulty = "intermediate";
      } else {
        difficulty = "advanced";
      }
      return {
        id: `md_${Date.now()}_${generateId()}`,
        title: question.title,
        content: question.content,
        type,
        difficulty,
        options: question.options,
        correctAnswers: question.correctAnswers,
        explanation: question.explanation || "",
        category: question.category || "General",
        learningPath: question.learningPath || "Default Learning Path",
        topic: question.topic || "General Topic",
        tags: question.tags || [],
        points: question.points || 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        createdBy: "markdown-parser",
      };
    });

    return {
      questions: unifiedQuestions,
      metadata: {
        source: "markdown-parser",
        version: "1.0.0",
        totalCount: unifiedQuestions.length,
        categories: [...new Set(unifiedQuestions.map((q) => q.category))],
        difficulties: [...new Set(unifiedQuestions.map((q) => q.difficulty))],
        learningPaths: [
          ...new Set(unifiedQuestions.map((q) => q.learningPath)),
        ],
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
      },
    };
  }

  /**
   * Generate markdown template
   */
  static generateTemplate(): string {
    return `# Questions Template

## Multiple Choice Questions (Simple Format)

1. What is the capital of France?
a) London
b) Berlin
c) Paris [correct]
d) Madrid

Explanation: Paris is the capital and largest city of France.
Category: Geography
Learning Path: World Geography
Topic: European Capitals

## Multiple Choice Questions (GitHub Style with Code)

###### 1. What's the output?

\`\`\`javascript
function sayHi() {
  console.log(name);
  console.log(age);
  var name = 'Lydia';
  let age = 21;
}

sayHi();
\`\`\`

- A: \`Lydia\` and \`undefined\`
- B: \`Lydia\` and \`ReferenceError\`
- C: \`ReferenceError\` and \`21\`
- D: \`undefined\` and \`ReferenceError\`

<details><summary><b>Answer</b></summary>
<p>

#### Answer: D

Within the function, we first declare the \`name\` variable with the \`var\` keyword. This means that the variable gets hoisted (memory space is set up during the creation phase) with the default value of \`undefined\`, until we actually get to the line where we define the variable. We haven't defined the variable yet on the line where we try to log the \`name\` variable, so it still holds the value of \`undefined\`.

Variables with the \`let\` keyword (and \`const\`) are hoisted, but unlike \`var\`, don't get <i>initialized</i>. They are not accessible before the line we declare (initialize) them. This is called the "temporal dead zone". When we try to access the variables before they are declared, JavaScript throws a \`ReferenceError\`.

</p>
</details>

---

## True/False Questions

2. The sun rises in the west.
True
False [correct]

Explanation: The sun rises in the east and sets in the west.
Category: Science
Learning Path: Basic Astronomy
Topic: Earth's Rotation

## Open-ended Questions

3. Explain the concept of object-oriented programming.

Category: Programming
Learning Path: Software Development Fundamentals
Topic: Programming Paradigms
Difficulty: medium

## Question with Full Metadata

4. What is React? [5 points]
a) A CSS framework
b) A JavaScript library [correct]
c) A database
d) A server

Category: Frontend Development
Learning Path: React Fundamentals
Topic: JavaScript Libraries
Tags: #react #javascript #frontend
Difficulty: easy

Explanation: React is a JavaScript library for building user interfaces.

## Remember:
- Use numbered lists for questions (1., 2., 3.)
- Use 'a)', 'b)', 'c)' etc. for simple multiple-choice options
- Use '- A:', '- B:', '- C:', '- D:' for GitHub-style options
- Mark correct options with '[correct]' or use HTML details/summary with Answer: X
- Use 'Category:', 'Learning Path:', 'Topic:', 'Tags:', 'Difficulty:', 'Points:' for metadata
- Tags should be space or comma-separated, and can start with '#'
- Difficulty can be 'easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced'
- Points can be specified in the title like '[5 points]'
- All metadata fields are optional - questions will work without them
- For code questions, use \`\`\`language blocks
- For detailed explanations, use HTML <details><summary>Answer</summary><p>explanation</p></details>
`;
  }
}

export default MarkdownQuestionParser;
