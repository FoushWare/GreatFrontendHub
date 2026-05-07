import {
  LearningItem,
  LearningGoal,
  ProgressStats,
  LearningRecommendation,
} from "@elzatona/types";

// Sample learning items covering frontend development topics
export const sampleLearningItems: LearningItem[] = [
  // JavaScript Fundamentals
  {
    id: "js-1",
    title: "JavaScript Variables and Data Types",
    description:
      "Learn about var, let, const, and primitive data types in JavaScript",
    category: "javascript",
    subCategory: "fundamentals",
    difficulty: "beginner",
    estimatedTime: 30,
    tags: ["variables", "data-types", "es6"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["js-basics-book", "mdn-js"],
    relatedChallenges: ["challenge-1"],
    relatedQuestions: ["question-1"],
  },
  {
    id: "js-2",
    title: "Functions and Scope",
    description:
      "Understand function declarations, expressions, arrow functions, and scope",
    category: "javascript",
    subCategory: "functions",
    difficulty: "beginner",
    estimatedTime: 45,
    tags: ["functions", "scope", "closures", "arrow-functions"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["js-functions-guide"],
    relatedChallenges: ["challenge-2"],
    relatedQuestions: ["question-2"],
  },
  {
    id: "js-3",
    title: "Array Methods and Manipulation",
    description:
      "Master array methods like map, filter, reduce, and array manipulation",
    category: "javascript",
    subCategory: "arrays",
    difficulty: "intermediate",
    estimatedTime: 60,
    tags: ["arrays", "functional-programming", "es6"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["js-arrays-guide"],
    relatedChallenges: ["challenge-3"],
    relatedQuestions: ["question-3"],
  },
  {
    id: "js-4",
    title: "Promises and Async/Await",
    description: "Learn asynchronous programming with Promises and async/await",
    category: "javascript",
    subCategory: "async",
    difficulty: "intermediate",
    estimatedTime: 75,
    tags: ["promises", "async-await", "asynchronous"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["js-async-guide"],
    relatedChallenges: ["challenge-4"],
    relatedQuestions: ["question-4"],
  },
  {
    id: "js-5",
    title: "ES6+ Features",
    description:
      "Master modern JavaScript features like destructuring, spread, modules",
    category: "javascript",
    subCategory: "es6",
    difficulty: "intermediate",
    estimatedTime: 60,
    tags: ["es6", "destructuring", "spread", "modules"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["es6-guide"],
    relatedChallenges: ["challenge-5"],
    relatedQuestions: ["question-5"],
  },

  // React Fundamentals
  {
    id: "react-1",
    title: "React Components and JSX",
    description:
      "Learn React components, JSX syntax, and component composition",
    category: "react",
    subCategory: "components",
    difficulty: "beginner",
    estimatedTime: 45,
    tags: ["components", "jsx", "composition"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["react-basics"],
    relatedChallenges: ["challenge-6"],
    relatedQuestions: ["question-6"],
  },
  {
    id: "react-2",
    title: "React Hooks (useState, useEffect)",
    description: "Master React hooks for state management and side effects",
    category: "react",
    subCategory: "hooks",
    difficulty: "intermediate",
    estimatedTime: 60,
    tags: ["hooks", "useState", "useEffect", "state"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["react-hooks-guide"],
    relatedChallenges: ["challenge-7"],
    relatedQuestions: ["question-7"],
  },
  {
    id: "react-3",
    title: "React Context and State Management",
    description: "Learn React Context API and state management patterns",
    category: "react",
    subCategory: "state-management",
    difficulty: "intermediate",
    estimatedTime: 75,
    tags: ["context", "state-management", "global-state"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["react-context-guide"],
    relatedChallenges: ["challenge-8"],
    relatedQuestions: ["question-8"],
  },
  {
    id: "react-4",
    title: "React Performance Optimization",
    description:
      "Learn React.memo, useMemo, useCallback, and performance best practices",
    category: "react",
    subCategory: "performance",
    difficulty: "advanced",
    estimatedTime: 90,
    tags: ["performance", "optimization", "memoization"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["react-performance-guide"],
    relatedChallenges: ["challenge-9"],
    relatedQuestions: ["question-9"],
  },

  // CSS Fundamentals
  {
    id: "css-1",
    title: "CSS Layout with Flexbox",
    description: "Master CSS Flexbox for modern layout design",
    category: "css",
    subCategory: "layout",
    difficulty: "beginner",
    estimatedTime: 45,
    tags: ["flexbox", "layout", "css3"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["css-flexbox-guide"],
    relatedChallenges: ["challenge-10"],
    relatedQuestions: ["question-10"],
  },
  {
    id: "css-2",
    title: "CSS Grid Layout",
    description: "Learn CSS Grid for complex two-dimensional layouts",
    category: "css",
    subCategory: "layout",
    difficulty: "intermediate",
    estimatedTime: 60,
    tags: ["grid", "layout", "css3"],
    isCompleted: false,
    priority: "high",
    relatedResources: ["css-grid-guide"],
    relatedChallenges: ["challenge-11"],
    relatedQuestions: ["question-11"],
  },
  {
    id: "css-3",
    title: "CSS Animations and Transitions",
    description: "Create smooth animations and transitions with CSS",
    category: "css",
    subCategory: "animations",
    difficulty: "intermediate",
    estimatedTime: 45,
    tags: ["animations", "transitions", "keyframes"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["css-animations-guide"],
    relatedChallenges: ["challenge-12"],
    relatedQuestions: ["question-12"],
  },

  // HTML and Semantics
  {
    id: "html-1",
    title: "HTML Semantic Elements",
    description:
      "Learn semantic HTML elements for better accessibility and SEO",
    category: "html",
    subCategory: "semantics",
    difficulty: "beginner",
    estimatedTime: 30,
    tags: ["semantic", "accessibility", "seo"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["html-semantics-guide"],
    relatedChallenges: ["challenge-13"],
    relatedQuestions: ["question-13"],
  },

  // System Design
  {
    id: "system-1",
    title: "Frontend Architecture Patterns",
    description: "Learn frontend architecture patterns and best practices",
    category: "system-design",
    subCategory: "architecture",
    difficulty: "advanced",
    estimatedTime: 120,
    tags: ["architecture", "patterns", "best-practices"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["frontend-architecture-guide"],
    relatedChallenges: ["challenge-14"],
    relatedQuestions: ["question-14"],
  },

  // Performance
  {
    id: "perf-1",
    title: "Web Performance Optimization",
    description:
      "Learn techniques for optimizing web performance and Core Web Vitals",
    category: "performance",
    subCategory: "optimization",
    difficulty: "advanced",
    estimatedTime: 90,
    tags: ["performance", "core-web-vitals", "optimization"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["web-performance-guide"],
    relatedChallenges: ["challenge-15"],
    relatedQuestions: ["question-15"],
  },

  // Testing
  {
    id: "test-1",
    title: "Frontend Testing with Jest and React Testing Library",
    description:
      "Learn to write tests for React components and JavaScript functions",
    category: "testing",
    subCategory: "unit-testing",
    difficulty: "intermediate",
    estimatedTime: 75,
    tags: ["testing", "jest", "react-testing-library"],
    isCompleted: false,
    priority: "medium",
    relatedResources: ["frontend-testing-guide"],
    relatedChallenges: ["challenge-16"],
    relatedQuestions: ["question-16"],
  },
];

// Sample learning goals
export const sampleLearningGoals: LearningGoal[] = [
  {
    id: "goal-1",
    title: "JavaScript Fundamentals Mastery",
    description:
      "Complete all JavaScript fundamentals to build a strong foundation",
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    targetHours: 8,
    currentHours: 0,
    isCompleted: false,
    learningItems: ["js-1", "js-2", "js-3", "js-4", "js-5"],
  },
  {
    id: "goal-2",
    title: "React Core Concepts",
    description: "Master React fundamentals and hooks for building modern UIs",
    targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    targetHours: 12,
    currentHours: 0,
    isCompleted: false,
    learningItems: ["react-1", "react-2", "react-3", "react-4"],
  },
  {
    id: "goal-3",
    title: "CSS Layout Mastery",
    description:
      "Become proficient with Flexbox and Grid for responsive layouts",
    targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    targetHours: 6,
    currentHours: 0,
    isCompleted: false,
    learningItems: ["css-1", "css-2", "css-3"],
  },
];

// Utility functions
export const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    javascript: "⚡",
    react: "⚛️",
    css: "🎨",
    html: "🌐",
    "system-design": "🏗️",
    algorithms: "🧮",
    "web-apis": "🔌",
    performance: "🚀",
    accessibility: "♿",
    testing: "🧪",
  };
  return icons[category] || "📚";
};

export const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    beginner: "text-green-400",
    intermediate: "text-yellow-400",
    advanced: "text-red-400",
  };
  return colors[difficulty] || "text-gray-400";
};

export const getDifficultyBgColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    beginner: "bg-green-600",
    intermediate: "bg-yellow-600",
    advanced: "bg-red-600",
  };
  return colors[difficulty] || "bg-gray-600";
};

export const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "text-blue-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };
  return colors[priority] || "text-gray-400";
};

export const getPriorityBgColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-blue-600",
    medium: "bg-yellow-600",
    high: "bg-red-600",
  };
  return colors[priority] || "bg-gray-600";
};

export const calculateProgressStats = (
  items: LearningItem[],
): ProgressStats => {
  const totalItems = items.length;
  const completedItems = items.filter((item) => item.isCompleted).length;
  const completionPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const totalEstimatedTime = items.reduce(
    (sum, item) => sum + item.estimatedTime,
    0,
  );
  const totalActualTime = items.reduce(
    (sum, item) => sum + (item.actualTimeSpent || 0),
    0,
  );
  const timeEfficiency =
    totalEstimatedTime > 0
      ? Math.round((totalActualTime / totalEstimatedTime) * 100)
      : 0;

  // Category breakdown
  const categoryBreakdown: Record<
    string,
    { total: number; completed: number; percentage: number }
  > = {};
  items.forEach((item) => {
    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = {
        total: 0,
        completed: 0,
        percentage: 0,
      };
    }
    categoryBreakdown[item.category].total++;
    if (item.isCompleted) {
      categoryBreakdown[item.category].completed++;
    }
  });

  Object.keys(categoryBreakdown).forEach((category) => {
    const { total, completed } = categoryBreakdown[category];
    categoryBreakdown[category].percentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  // Difficulty breakdown
  const difficultyBreakdown: Record<
    string,
    { total: number; completed: number; percentage: number }
  > = {};
  items.forEach((item) => {
    if (!difficultyBreakdown[item.difficulty]) {
      difficultyBreakdown[item.difficulty] = {
        total: 0,
        completed: 0,
        percentage: 0,
      };
    }
    difficultyBreakdown[item.difficulty].total++;
    if (item.isCompleted) {
      difficultyBreakdown[item.difficulty].completed++;
    }
  });

  Object.keys(difficultyBreakdown).forEach((difficulty) => {
    const { total, completed } = difficultyBreakdown[difficulty];
    difficultyBreakdown[difficulty].percentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  return {
    totalItems,
    completedItems,
    completionPercentage,
    totalEstimatedTime,
    totalActualTime,
    timeEfficiency,
    categoryBreakdown,
    difficultyBreakdown,
  };
};

export const getLearningRecommendations = (
  items: LearningItem[],
): LearningRecommendation[] => {
  const incompleteItems = items.filter((item) => !item.isCompleted);

  // Sort by priority and difficulty (high priority + beginner first)
  const sortedItems = [...incompleteItems].sort((a, b) => {
    const priorityOrder: Record<"high" | "medium" | "low", number> = {
      high: 3,
      medium: 2,
      low: 1,
    };
    const difficultyOrder: Record<
      "beginner" | "intermediate" | "advanced",
      number
    > = { beginner: 1, intermediate: 2, advanced: 3 };

    const priorityDiff =
      priorityOrder[b.priority as "high" | "medium" | "low"] -
      priorityOrder[a.priority as "high" | "medium" | "low"];
    if (priorityDiff !== 0) return priorityDiff;

    return (
      difficultyOrder[
        a.difficulty as "beginner" | "intermediate" | "advanced"
      ] -
      difficultyOrder[b.difficulty as "beginner" | "intermediate" | "advanced"]
    );
  });

  return sortedItems.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    reason: `High priority ${item.difficulty} level item in ${item.category}`,
    priority: item.priority,
    estimatedTime: item.estimatedTime,
    category: item.category,
    difficulty: item.difficulty,
  }));
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
};
