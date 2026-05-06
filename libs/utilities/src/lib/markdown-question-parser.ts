// v1.0 - Markdown Question Parser
// Parses markdown content to extract questions in various formats

import { BulkQuestionData } from "./unified-question-schema";
import { FilterXSS, type IFilterXSSOptions } from "xss";

/**
 * Completely remove all HTML tags including incomplete ones
 * This function uses a comprehensive regex-based approach to remove all HTML tags
 * @param text - Text that may contain HTML tags
 * @returns Plain text with all HTML tags removed
 */
/**
 * XSS filter options for complete HTML tag removal (empty whitelist)
 * This configuration strips ALL HTML tags, which CodeQL recognizes as safe
 */
const xssStripAllOptions: IFilterXSSOptions = {
  whiteList: {}, // Empty whitelist = strip all tags
  stripIgnoreTag: true, // Remove all tags not in whitelist (which is all tags)
  stripIgnoreTagBody: ["script"], // Also remove script tag content
};

/**
 * XSS filter instance for complete HTML removal
 */
const xssStripAllFilter = new FilterXSS(xssStripAllOptions);

/**
 * Completely remove all HTML tags including incomplete ones
 * This function uses the xss library which CodeQL recognizes as safe
 * @param text - Text that may contain HTML tags
 * @returns Plain text with all HTML tags removed
 */
function removeAllHTMLTagsComprehensive(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // This catches edge cases where tags are malformed or incomplete
  let cleaned = xssStripAllFilter.process(text);

  cleaned = cleaned.replaceAll(/<[^>]*$/g, ""); // Remove incomplete tags at end
  cleaned = cleaned.replaceAll(/<[^<]*$/g, ""); // Remove any remaining < characters

  return cleaned.trim();
}

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
  private static readonly OPTION_PATTERN =
    /^([a-zA-Z])\)\s*(.*?)(?:\s*\[(?:correct|x|✓)\])?$/gm;

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
    const questions: MarkdownQuestion[] = [];

    // Try GitHub-style format first
    const githubQuestions = this.parseGitHubStyleMultipleChoice(section);
    questions.push(...githubQuestions);

    if (questions.length > 0) {
      return questions;
    }

    // Fallback to simple format
    const simpleQuestions = this.parseSimpleFormatMultipleChoice(section);
    return simpleQuestions;
  }

  /**
   * Parse GitHub-style multiple choice questions
   */
  private static parseGitHubStyleMultipleChoice(
    section: string,
  ): MarkdownQuestion[] {
    const questions: MarkdownQuestion[] = [];

    const githubSections = section
      .split(/(?=^#{1,6}\s*\d+\.)/gm)
      .filter((block) => block.trim());

    for (const block of githubSections) {
      const question = this.parseSingleGitHubQuestion(block);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Parse a single GitHub-style question block
   */
  private static parseSingleGitHubQuestion(
    block: string,
  ): MarkdownQuestion | null {
    const lines = block.split("\n");
    let questionText = "";
    let optionsText = "";
    let inCodeBlock = false;
    let correctAnswer = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineResult = this.processGitHubQuestionLine(line, lines, i, {
        inCodeBlock,
        questionText,
        optionsText,
        correctAnswer,
      });

      inCodeBlock = lineResult.inCodeBlock;
      questionText = lineResult.questionText;
      optionsText = lineResult.optionsText;
      correctAnswer = lineResult.correctAnswer;
    }

    if (!questionText || !optionsText) {
      return null;
    }

    const options = this.parseOptions(optionsText, correctAnswer);
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

  private static processGitHubQuestionLine(
    line: string,
    lines: string[],
    lineIndex: number,
    state: {
      inCodeBlock: boolean;
      questionText: string;
      optionsText: string;
      correctAnswer: string;
    },
  ) {
    const nextState = { ...state };

    if (this.isGitHubQuestionHeader(line)) {
      nextState.questionText = this.extractGitHubHeaderText(line);
      return nextState;
    }

    if (line.startsWith("```")) {
      nextState.inCodeBlock = !state.inCodeBlock;
      return nextState;
    }

    if (state.inCodeBlock) {
      return nextState;
    }

    if (this.isGitHubOptionLine(line)) {
      nextState.optionsText += `${line}\n`;
    }

    const detailsAnswer = this.extractAnswerFromDetailsIfPresent(
      line,
      lines,
      lineIndex,
    );
    if (detailsAnswer) {
      nextState.correctAnswer = detailsAnswer;
    }

    const directAnswer = this.extractDirectAnswer(line);
    if (directAnswer) {
      nextState.correctAnswer = directAnswer;
    }

    return nextState;
  }

  private static isGitHubQuestionHeader(line: string): boolean {
    return /^#{1,6}\s*\d+\./.test(line);
  }

  private static extractGitHubHeaderText(line: string): string {
    return line.replace(/^#{1,6}\s*\d+\.?\s*/, "").trim();
  }

  private static isGitHubOptionLine(line: string): boolean {
    return /^-?\s*[A-Z]:\s*/.test(line);
  }

  private static extractAnswerFromDetailsIfPresent(
    line: string,
    lines: string[],
    lineIndex: number,
  ): string {
    if (!line.includes("<details>") && !line.includes("<summary>")) {
      return "";
    }
    return this.extractAnswerFromDetails(lines, lineIndex);
  }

  private static extractDirectAnswer(line: string): string {
    if (!line.includes("Answer:") && !line.includes("**Answer:")) {
      return "";
    }

    const answerMatch = /Answer:\s*(?<answer>[A-D])/i.exec(line);
    return answerMatch?.groups?.answer
      ? answerMatch.groups.answer.toLowerCase()
      : "";
  }

  /**
   * Extract answer from HTML details section
   */
  private static extractAnswerFromDetails(
    lines: string[],
    startIndex: number,
  ): string {
    for (let j = startIndex; j < Math.min(startIndex + 10, lines.length); j++) {
      const answerLine = lines[j].trim();
      if (answerLine.includes("Answer:") || answerLine.includes("**Answer:")) {
        const answerMatch = /Answer:\s*(?<answer>[A-D])/i.exec(answerLine);
        if (answerMatch?.groups?.answer) {
          return answerMatch.groups.answer.toLowerCase();
        }
      }
    }
    return "";
  }

  /**
   * Parse simple format multiple choice questions
   */
  private static parseSimpleFormatMultipleChoice(
    section: string,
  ): MarkdownQuestion[] {
    const questions: MarkdownQuestion[] = [];

    const questionBlocks = section
      .split(/(?=^\d+\.)/gm)
      .filter((block) => block.trim());

    for (const block of questionBlocks) {
      const question = this.parseSingleSimpleQuestion(block);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Parse a single simple format question block
   */
  private static parseSingleSimpleQuestion(
    block: string,
  ): MarkdownQuestion | null {
    const lines = block.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return null;

    const questionText = lines[0].trim();
    if (!/^\d+\./.test(questionText)) return null;
    // Find all option lines (a), b), c), etc.)
    const optionLines = lines.filter((line) =>
      /^[a-zA-Z]\)\s/.test(line.trim()),
    );

    if (optionLines.length < 2) return null;

    const options = this.parseOptions(optionLines.join("\n"));
    if (options.length < 2) return null;

    const correctAnswers = options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    if (correctAnswers.length === 0) return null;

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
      if (!/^\d+\./.test(line)) continue;

      const nextLine = lines[i + 1]?.trim();
      if (!nextLine || !/^(True|False|T|F)$/i.test(nextLine)) continue;

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
      if (!/^\d+\./.test(line)) continue;
      if (/(?:True|False|T|F)$/i.test(line)) continue; // Skip T/F questions
      if (!/(?:Explain|Describe|What|How|Why)/i.test(line)) continue;

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
    const githubMatches = [...optionsText.matchAll(githubPattern)];

    if (githubMatches.length > 0) {
      for (const match of githubMatches) {
        const id = match[1]?.toLowerCase() || "";
        const text = (match[2] || "").trim();
        const isCorrect = correctAnswer
          ? id === correctAnswer.toLowerCase()
          : text.includes("[correct]") ||
            text.includes("[x]") ||
            text.includes("[✓]") ||
            text.includes("**Answer:") ||
            text.includes("Answer:");

        options.push({ id, text, isCorrect });
      }
      return options;
    }

    // Fallback to simple format (a) text)
    const matches = [...optionsText.matchAll(this.OPTION_PATTERN)];

    for (const match of matches) {
      const id = match[1]?.toLowerCase() || "";
      const text = (match[2] || "").trim();
      const isCorrect = correctAnswer
        ? id === correctAnswer.toLowerCase()
        : match[0].includes("[correct]") ||
          match[0].includes("[x]") ||
          match[0].includes("[✓]");

      options.push({ id, text, isCorrect });
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
      /<details>[\s\S]*?<summary>[\s\S]*?<\/summary>[\s\S]*?<p>[\s\S]*?<\/p>[\s\S]*?<\/details>/i.exec(
        section,
      );

    if (detailsMatch) {
      // Extract content between <p> tags, removing HTML tags
      const pMatch = /<p>([\s\S]*?)<\/p>/i.exec(detailsMatch[0]);
      if (pMatch) {
        const cleaned = removeAllHTMLTagsComprehensive(pMatch[1]);
        return cleaned
          .replaceAll(/\n\s*\n/g, "\n") // Clean up extra whitespace
          .trim();
      }
    }

    // Fallback to simple explanation format
    const explanationMatch = /explanation[:\s]+(.*?)(?:\n\n|\n$|$)/i.exec(
      section,
    );
    return explanationMatch ? explanationMatch[1].trim() : undefined;
  }

  private static extractCategory(section: string): string | undefined {
    const categoryMatch = /category[:\s]+(.*?)(?:\n|$)/i.exec(section);
    return categoryMatch ? categoryMatch[1].trim() : undefined;
  }

  private static extractLearningPath(section: string): string | undefined {
    const learningPathMatch =
      /(?:learning[_\s]?path|learningpath)[:\s]+(.*?)(?:\n|$)/i.exec(section);
    return learningPathMatch ? learningPathMatch[1].trim() : undefined;
  }

  private static extractTopic(section: string): string | undefined {
    const topicMatch = /topic[:\s]+(.*?)(?:\n|$)/i.exec(section);
    return topicMatch ? topicMatch[1].trim() : undefined;
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
        id: `md_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
`;
  }
}

export default MarkdownQuestionParser;
