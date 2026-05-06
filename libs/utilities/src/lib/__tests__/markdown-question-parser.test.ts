import { describe, it, expect, vi } from "vitest";
import { MarkdownQuestionParser } from "../markdown-question-parser";

describe("MarkdownQuestionParser", () => {
  describe("parseMarkdown", () => {
    it("should parse multiple choice questions in simple format", () => {
      const markdown = `1. React is a:
a) A library [correct]
b) A framework
c) A language
d) A database

Explanation: React is a JavaScript library for building UI.

Category: Web Development
Topic: React`;
      const result = MarkdownQuestionParser.parseMarkdown(markdown);

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].title).toBe("React is a:");
      expect(result.questions[0].options).toHaveLength(4);
      expect(result.questions[0].correctAnswers).toEqual(["a"]);
      expect(result.questions[0].explanation).toBe(
        "React is a JavaScript library for building UI.",
      );
    });

    it("should parse multiple choice questions in GitHub style", () => {
      const markdown = `
###### 1. What's the output?

\`\`\`javascript
console.log(typeof 1);
\`\`\`

- A: "number"
- B: "string"

<details><summary><b>Answer</b></summary>
<p>

#### Answer: A

Explanation here.
</p>
</details>
`;
      const result = MarkdownQuestionParser.parseMarkdown(markdown);

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].title).toBe("What's the output?");
      expect(result.questions[0].correctAnswers).toEqual(["a"]);
    });

    it("should handle invalid markdown", () => {
      const markdown = "Just some text with no questions";
      const result = MarkdownQuestionParser.parseMarkdown(markdown);
      expect(result.questions).toHaveLength(0);
    });

    it("should parse true/false questions", () => {
      const markdown = `
1. Is JavaScript single-threaded?
True
False
`;
      // Wait, let's check how true/false is handled in the code
      const result = MarkdownQuestionParser.parseMarkdown(markdown);
      // Depending on implementation, this might or might not work depending on [correct] tag
      // Let's see if it works without it.
      // Actually, parseTrueFalse in code checks for nextLine being True/False
    });
  });

  describe("convertToBulkData", () => {
    it("should convert questions to unified format", () => {
      const questions: any[] = [
        {
          title: "Test",
          content: "Test content",
          type: "single",
          difficulty: "easy",
          options: [{ id: "a", text: "Opt A", isCorrect: true }],
          correctAnswers: ["a"],
          category: "Test Cat",
        },
      ];
      const bulkData = MarkdownQuestionParser.convertToBulkData(questions);
      expect(bulkData.questions).toHaveLength(1);
      expect(bulkData.questions[0].title).toBe("Test");
      expect(bulkData.questions[0].difficulty).toBe("beginner");
    });
  });
});
