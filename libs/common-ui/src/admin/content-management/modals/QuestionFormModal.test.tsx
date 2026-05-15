import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QuestionFormModal } from "./QuestionFormModal";
import type { AdminUnifiedQuestion } from "@elzatona/types";

vi.mock("../../questions/QuestionForm", () => ({
  AdminQuestionForm: () => <div data-testid="admin-question-form" />,
}));

describe("QuestionFormModal", () => {
  const sampleQuestion = {
    id: "q-1",
    title: "Question 1",
  } as AdminUnifiedQuestion;

  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    question: null,
    cards: [],
    allCategories: [],
    onSubmit: vi.fn(async () => {}),
  };

  it("renders create mode by default", () => {
    const { container } = render(<QuestionFormModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Create New Question" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders view mode when readOnly is true", () => {
    render(
      <QuestionFormModal
        {...defaultProps}
        readOnly
        question={sampleQuestion}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "View Question" }),
    ).toBeInTheDocument();
  });

  it("renders edit mode when question exists and readOnly is false", () => {
    render(
      <QuestionFormModal
        {...defaultProps}
        readOnly={false}
        question={sampleQuestion}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Edit Question" }),
    ).toBeInTheDocument();
  });
});
