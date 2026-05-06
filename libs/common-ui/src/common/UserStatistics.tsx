"use client";

import React from "react";
import { Users, TrendingUp, Award, Clock } from "lucide-react";

interface UserStats {
  activeLearners: number;
  successRate: number;
  totalQuestions: number;
  averageTime: string;
}

export const UserStatistics: React.FC = () => {
  // Hardcoded stats - show immediately without loading or animation delays
  const stats: UserStats = {
    activeLearners: 49500, // 49.5K+
    successRate: 86, // 86%
    totalQuestions: 2226300, // 2226.3K+
    averageTime: "32m", // 32m
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K+";
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Active Learners */}
      <div className="text-center group/stat">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-300">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {formatNumber(stats.activeLearners)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Active Learners
        </div>
      </div>

      {/* Success Rate */}
      <div className="text-center group/stat">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-300">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {stats.successRate}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Success Rate
        </div>
      </div>

      {/* Total Questions */}
      <div className="text-center group/stat">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-300">
          <Award className="w-8 h-8 text-white" />
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {formatNumber(stats.totalQuestions)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Questions Solved
        </div>
      </div>

      {/* Average Time */}
      <div className="text-center group/stat">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-300">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {stats.averageTime}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Avg. Study Time
        </div>
      </div>
    </div>
  );
};
