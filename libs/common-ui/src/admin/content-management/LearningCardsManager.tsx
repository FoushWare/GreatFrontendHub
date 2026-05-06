import React from "react";
import {
  AdminLearningCard,
  AdminCategory,
  Topic,
  AdminUnifiedQuestion,
  ContentManagementStats,
} from "@elzatona/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Layers,
  Edit,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Trash2,
  Target,
  Eye,
  Pencil,
} from "lucide-react";

const CARD_ICONS = {
  "Core Technologies": { icon: Layers, color: "#3B82F6" },
  "Problem Solving": { icon: Layers, color: "#F59E0B" },
  "System Design": { icon: Layers, color: "#EF4444" },
  "Frontend Tasks": { icon: Target, color: "#8B5CF6" },
} as const;

// Helper functions to avoid nested filter operations
function countQuestionsForCategories(
  categories: AdminCategory[],
  topics: Topic[],
  questions: AdminUnifiedQuestion[],
): number {
  return categories.reduce((total, cat) => {
    const categoryTopics = topics.filter(
      (topic) => topic.category_id === cat.id,
    );
    const categoryQuestionsCount = categoryTopics.reduce(
      (topicTotal, topic) => {
        return topicTotal + countQuestionsForCategory(topic.id, questions);
      },
      0,
    );
    return total + categoryQuestionsCount;
  }, 0);
}

function countQuestionsForCategory(
  topicId: string,
  questions: AdminUnifiedQuestion[],
): number {
  return questions.filter((q) => q.topic_id === topicId).length;
}

function countTopicsForCategories(
  categories: AdminCategory[],
  topics: Topic[],
): number {
  return categories.reduce((total, cat) => {
    const categoryTopics = topics.filter(
      (topic) => topic.category_id === cat.id,
    );
    return total + categoryTopics.length;
  }, 0);
}

interface LearningCardsManagerProps {
  cards: AdminLearningCard[];
  categories: AdminCategory[];
  topics: Topic[];
  questions: AdminUnifiedQuestion[];
  stats: ContentManagementStats;
  expandedCards: Set<string>;
  toggleCard: (id: string) => void;
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  expandedTopics: Set<string>;
  toggleTopic: (id: string) => void;
  onEditCard: (card: AdminLearningCard) => void;
  onDeleteCard: (card: AdminLearningCard) => void;
  onCreateCard: () => void;
  onEditCategories: () => void;
  onViewQuestion?: (question: AdminUnifiedQuestion) => void;
  onEditQuestion?: (question: AdminUnifiedQuestion) => void;
  onCreateQuestion?: (topicId: string) => void;
}

const TopicNode: React.FC<{
  topic: Topic;
  questions: AdminUnifiedQuestion[];
  expandedTopics: Set<string>;
  toggleTopic: (id: string) => void;
  onViewQuestion?: (question: AdminUnifiedQuestion) => void;
  onEditQuestion?: (question: AdminUnifiedQuestion) => void;
  onCreateQuestion?: (topicId: string) => void;
}> = ({
  topic,
  questions,
  expandedTopics,
  toggleTopic,
  onViewQuestion,
  onEditQuestion,
  onCreateQuestion,
}) => {
  const topicQuestions = questions.filter((q) => q.topic_id === topic.id);

  return (
    <div
      id={`topic-${topic.id}`}
      className="border-l-2 border-gray-100 pl-4 py-2"
    >
      <div className="flex items-center justify-between gap-4 rounded p-2 transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 group">
        {/* Left section: expandable content with description */}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start space-x-3 text-left"
          onClick={() => toggleTopic(topic.id)}
        >
          <div className="flex items-center space-x-2 shrink-0">
            <div className="p-1">
              {expandedTopics.has(topic.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <Target className="h-4 w-4 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h5 className="break-words font-medium text-gray-900 dark:text-white">
              {topic.name}
            </h5>
            <p className="line-clamp-1 break-words text-sm text-gray-600 dark:text-gray-400">
              {topic.description}
            </p>
          </div>
        </button>

        {/* Right section: badges and action buttons - fixed width */}
        <div className="ml-auto flex min-w-[12rem] shrink-0 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Create Question"
            onClick={(e) => {
              e.stopPropagation();
              onCreateQuestion?.(topic.id);
            }}
          >
            <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>
          <Badge
            variant="outline"
            className="ml-auto shrink-0 whitespace-nowrap bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
          >
            {topicQuestions.length} Questions
          </Badge>
        </div>
      </div>

      {expandedTopics.has(topic.id) && (
        <div className="mt-2 ml-8 space-y-1">
          {topicQuestions.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No questions assigned to this topic yet.
            </p>
          ) : (
            topicQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-center justify-between rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {question.title}
                  </p>
                  {question.difficulty && (
                    <p className="text-gray-500 dark:text-gray-400">
                      {question.difficulty}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="View Question"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewQuestion?.(question);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="Edit Question"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditQuestion?.(question);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CategoryNode: React.FC<{
  category: AdminCategory;
  categoryTopics: Topic[];
  questions: AdminUnifiedQuestion[];
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  expandedTopics: Set<string>;
  toggleTopic: (id: string) => void;
  onViewQuestion?: (question: AdminUnifiedQuestion) => void;
  onEditQuestion?: (question: AdminUnifiedQuestion) => void;
  onCreateQuestion?: (topicId: string) => void;
}> = ({
  category,
  categoryTopics,
  questions,
  expandedCategories,
  toggleCategory,
  expandedTopics,
  toggleTopic,
  onViewQuestion,
  onEditQuestion,
  onCreateQuestion,
}) => {
  return (
    <div
      id={`category-${category.id}`}
      className="ml-6 border-l-2 border-gray-200 pl-4"
    >
      <button
        type="button"
        className="flex items-center justify-between gap-4 py-2 px-2 rounded transition-all duration-200 w-full hover:bg-gray-50/80 dark:hover:bg-gray-800/80 group"
        onClick={() => toggleCategory(category.id)}
      >
        {/* Left section: description and metadata */}
        <div className="flex min-w-0 flex-1 items-center space-x-3">
          <div className="flex items-center space-x-2 shrink-0">
            <div className="p-1">
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="break-words font-medium text-gray-900 dark:text-white">
              {category.name}
            </h4>
            <p className="line-clamp-1 break-words text-sm text-gray-600 dark:text-gray-400">
              {category.description}
            </p>
          </div>
        </div>

        {/* Right section: badge with topic count */}
        <div className="ml-auto flex min-w-[10rem] shrink-0 items-center justify-end">
          <Badge
            variant="outline"
            className="ml-auto shrink-0 whitespace-nowrap bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
          >
            {categoryTopics.length} Topics
          </Badge>
        </div>
      </button>

      {expandedCategories.has(category.id) && (
        <div className="ml-6 space-y-2">
          {categoryTopics.map((topic) => (
            <TopicNode
              key={topic.id}
              topic={topic}
              questions={questions}
              expandedTopics={expandedTopics}
              toggleTopic={toggleTopic}
              onViewQuestion={onViewQuestion}
              onEditQuestion={onEditQuestion}
              onCreateQuestion={onCreateQuestion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LearningCardsManager: React.FC<LearningCardsManagerProps> = ({
  cards,
  categories,
  topics,
  questions,
  stats,
  expandedCards,
  toggleCard,
  expandedCategories,
  toggleCategory,
  expandedTopics,
  toggleTopic,
  onEditCard,
  onDeleteCard,
  onCreateCard,
  onEditCategories,
  onViewQuestion,
  onEditQuestion,
  onCreateQuestion,
}) => {
  const getCardCategories = (card: AdminLearningCard) =>
    categories.filter((cat) => cat.learning_card_id === card.id);

  const getCategoryTopics = (category: AdminCategory) =>
    topics.filter((topic) => topic.category_id === category.id);

  const renderCategoryNode = (category: AdminCategory) => {
    const categoryTopics = getCategoryTopics(category);

    return (
      <CategoryNode
        key={category.id}
        category={category}
        categoryTopics={categoryTopics}
        questions={questions}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
        expandedTopics={expandedTopics}
        toggleTopic={toggleTopic}
        onViewQuestion={onViewQuestion}
        onEditQuestion={onEditQuestion}
        onCreateQuestion={onCreateQuestion}
      />
    );
  };

  const renderCard = (card: AdminLearningCard) => {
    const cardCategories = getCardCategories(card);
    const IconComponent =
      CARD_ICONS[card.title as keyof typeof CARD_ICONS]?.icon || Layers;

    return (
      <Card
        id={`card-${card.id}`}
        key={card.id}
        className="border-l-4"
        style={{ borderLeftColor: card.color }}
      >
        <CardHeader className="pb-3 border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start space-x-3 text-left"
              onClick={() => toggleCard(card.id)}
            >
              <div className="p-1 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                {expandedCards.has(card.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <IconComponent
                className="h-5 w-5"
                style={{ color: card.color }}
              />
              <div className="min-w-0 flex-1 text-left">
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {card.title}
                </CardTitle>
                <p className="break-words text-sm text-gray-600 dark:text-gray-400">
                  {card.description}
                </p>
              </div>
            </button>
            <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
              <Badge
                variant="outline"
                className="shrink-0 whitespace-nowrap bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                {cardCategories.length} Categories
              </Badge>
              <Badge
                variant="outline"
                className="shrink-0 whitespace-nowrap bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              >
                {countTopicsForCategories(cardCategories, topics)} Topics
              </Badge>
              <Badge
                variant="outline"
                className="shrink-0 whitespace-nowrap bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
              >
                {countQuestionsForCategories(cardCategories, topics, questions)}{" "}
                Questions
              </Badge>
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCard(card);
                  }}
                  className="h-8 w-8 p-0 hover:bg-blue-100 z-10 relative"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCard(card);
                  }}
                  className="h-8 w-8 p-0 hover:bg-red-100 z-10 relative"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedCards.has(card.id) && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {cardCategories.map(renderCategoryNode)}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Layers className="h-5 w-5 mr-2 text-blue-600" />
          Learning Cards ({stats.totalCards})
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={onCreateCard}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Card</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {cards.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <CardContent className="p-8 text-center">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Learning Cards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first learning card to organize categories and
                topics for structured learning.
              </p>
            </CardContent>
          </Card>
        ) : (
          cards.map(renderCard)
        )}
      </div>
    </div>
  );
};

export default LearningCardsManager;
