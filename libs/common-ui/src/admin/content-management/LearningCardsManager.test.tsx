import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LearningCardsManager } from "./LearningCardsManager";
import type {
  AdminCategory,
  AdminLearningCard,
  AdminUnifiedQuestion,
  ContentManagementStats,
  Topic,
} from "@elzatona/types";

describe("LearningCardsManager", () => {
  it("keeps topic and category badges fixed on the right", () => {
    const cards = [
      {
        id: "card-1",
        title: "Core Technologies",
        description: "Main learning card",
        color: "#3B82F6",
      } as AdminLearningCard,
    ];
    const categories = [
      {
        id: "category-1",
        name: "JavaScript Programming",
        description: "Language basics",
        learning_card_id: "card-1",
      } as AdminCategory,
    ];
    const topics = [
      {
        id: "topic-1",
        name: "JavaScript Core Concepts",
        description: "Functions and objects",
        category_id: "category-1",
      } as Topic,
    ];
    const questions = [
      {
        id: "question-1",
        title: "Question 1",
        topic_id: "topic-1",
      } as AdminUnifiedQuestion,
    ];
    const stats = {
      totalCards: 1,
      totalPlans: 0,
      totalCategories: 1,
      totalTopics: 1,
      totalQuestions: 1,
    } as ContentManagementStats;

    const { container } = render(
      <LearningCardsManager
        cards={cards}
        categories={categories}
        topics={topics}
        questions={questions}
        stats={stats}
        expandedCards={new Set(["card-1"])}
        toggleCard={() => {}}
        expandedCategories={new Set(["category-1"])}
        toggleCategory={() => {}}
        expandedTopics={new Set(["topic-1"])}
        toggleTopic={() => {}}
        onEditCard={() => {}}
        onDeleteCard={() => {}}
        onCreateCard={() => {}}
        onEditCategories={() => {}}
      />,
    );

    expect(screen.getByText("Learning Cards (1)")).toBeInTheDocument();
    expect(screen.getByText("1 Categories")).toBeInTheDocument();
    expect(screen.getAllByText("1 Topics")).toHaveLength(2);
    expect(screen.getAllByText("1 Questions")).toHaveLength(2);

    const topicRow = container.querySelector("#topic-topic-1 > div");
    const categoryRow = container.querySelector(
      "#category-category-1 > button",
    );

    expect(topicRow).toBeInTheDocument();
    expect(categoryRow).toBeInTheDocument();
  });
});
