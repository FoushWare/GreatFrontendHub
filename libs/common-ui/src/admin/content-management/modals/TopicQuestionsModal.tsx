"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
  Checkbox,
} from "../../../index";
import { Target, Plus, Check } from "lucide-react";
import { Topic, LearningPlan, AdminUnifiedQuestion } from "@elzatona/types";

interface TopicQuestionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
  plan: LearningPlan | null;
  questions: AdminUnifiedQuestion[];
  selectedQuestions: Set<string>;
  onToggleQuestion: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAddSelected: () => void;
  onCancel: () => void;
}

export const TopicQuestionsModal: React.FC<TopicQuestionsModalProps> = ({
  isOpen,
  onOpenChange,
  topic,
  plan,
  questions,
  selectedQuestions,
  onToggleQuestion,
  onSelectAll,
  onDeselectAll,
  onAddSelected,
  onCancel,
}) => {
  const topicQuestions = topic
    ? questions.filter((q) => q.topic_id === topic.id)
    : [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col mx-auto my-auto"
        onOpenChange={onOpenChange}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-600" />
            <span>Add Questions to Plan</span>
          </DialogTitle>
          <DialogDescription>
            Select questions from &quot;{topic?.name}&quot; to add to &quot;
            {plan?.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Selection Controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                className="flex items-center space-x-2"
              >
                <div
                  className={`h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center transition-colors ${
                    selectedQuestions.size === topicQuestions.length &&
                    topicQuestions.length > 0
                      ? "bg-primary border-primary"
                      : "bg-transparent border-primary"
                  }`}
                >
                  {selectedQuestions.size === topicQuestions.length &&
                    topicQuestions.length > 0 && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                </div>
                <span>Select All</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeselectAll}
                className="flex items-center"
              >
                <span>Deselect All</span>
              </Button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedQuestions.size} of {topicQuestions.length} selected
            </div>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {topicQuestions.map((question) => (
              <div
                key={question.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedQuestions.has(question.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => onToggleQuestion(question.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <Checkbox
                      data-testid={`question-checkbox-${question.id}`}
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() => onToggleQuestion(question.id)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {question.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDifficultyColor(question.difficulty)}`}
                        >
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.type}
                        </Badge>
                      </div>
                    </div>
                    {question.explanation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onAddSelected}
            disabled={selectedQuestions.size === 0}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add {selectedQuestions.size} Questions to Plan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TopicQuestionsModal;
