"use client";

import { BookOpen, Calendar, Target, HelpCircle } from "lucide-react";

interface GuidedLearningHeaderProps {
  readonly questionsRange: string;
  readonly milestoneRange: string;
}

export function GuidedLearningHeader({
  questionsRange,
  milestoneRange,
}: Readonly<GuidedLearningHeaderProps>) {
  return (
    <div className="mb-8">
      {/* Animated Icon */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-xs font-bold text-yellow-900">✨</span>
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Guided Learning
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose a structured learning plan that fits your goals and mastery
          level
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {milestoneRange} Milestones
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
          <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            {questionsRange} Questions
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
          <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            All Skill Levels
          </span>
        </div>
      </div>
    </div>
  );
}
