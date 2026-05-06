"use client";

import {
  Play,
  RefreshCw,
  Calendar,
  Target,
  CheckCircle,
  Clock,
} from "lucide-react";
import { LearningPlan } from "../types";
import { StudyMilestone } from "@elzatona/types";

interface ActivePlanViewProps {
  readonly plan: LearningPlan;
  readonly milestones: StudyMilestone[];
  readonly currentMilestoneId: string | null;
  readonly onResume: () => void;
  readonly onReset: () => void;
}

export function ActivePlanView({
  plan,
  milestones,
  currentMilestoneId,
  onResume,
  onReset,
}: Readonly<ActivePlanViewProps>) {
  const completedMilestones = milestones.filter(
    (m) => m.progress === 100,
  ).length;
  const totalMilestones = milestones.length;
  const progressPercent =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  const currentMilestoneIndex =
    milestones.findIndex((m) => m.id === currentMilestoneId) + 1;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-blue-100 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
                Active Learning Path
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onResume}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="w-5 h-5" />
                Continue To Practice
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
                Reset Plan
              </button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium">Mastery Progress</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {progressPercent}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                <Calendar className="w-4 h-4" />
                <span>Milestone</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentMilestoneIndex || 1}/{totalMilestones}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedMilestones}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                <Target className="w-4 h-4" />
                <span>Topics</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.topics.length}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                <Clock className="w-4 h-4" />
                <span>Goal</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Flexible
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
