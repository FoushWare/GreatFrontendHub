"use client";

import {
  Clock,
  CheckCircle,
  Star,
  ChevronRight,
  Trophy,
  Calendar,
} from "lucide-react";
import { LearningPlan } from "../types";
import { getGradeColor, getGradeText } from "../utils";

interface LearningPlanCardProps {
  readonly plan: LearningPlan;
  readonly isCompleted: boolean;
  readonly grade?: number;
  readonly onSelect: (plan: LearningPlan) => void;
}

export function LearningPlanCard({
  plan,
  isCompleted,
  grade,
  onSelect,
}: Readonly<LearningPlanCardProps>) {
  const difficultyColors = {
    beginner:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  const milestoneCount = plan.milestones?.length || 0;
  const planDifficulty =
    plan.difficulty.toLowerCase() as keyof typeof difficultyColors;

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-3xl border-2 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group ${
        isCompleted && grade !== undefined
          ? getGradeColor(grade)
          : "border-gray-100 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500"
      }`}
    >
      {/* Recommended Badge */}
      {plan.isRecommended && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
          <Star className="w-3 h-3 fill-current" />
          Recommended
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && grade !== undefined && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
          <Trophy className="w-3 h-3" />
          {getGradeText(grade)}
        </div>
      )}

      <div className="p-8">
        {/* Plan Title */}
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
          {plan.title}
        </h3>

        {/* Difficulty Badge */}
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 ${
            difficultyColors[planDifficulty] || difficultyColors.intermediate
          }`}
        >
          {plan.difficulty}
        </span>

        {/* Subtitle/Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed font-medium">
          {plan.subtitle || plan.description}
        </p>

        {/* Stats Grid - Premium look */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Structure
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {milestoneCount} Milestones
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Estimate
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {plan.estimatedTotalTime || 0} Hours
            </span>
          </div>
        </div>

        {/* Outcomes Preview */}
        {plan.outcomes && plan.outcomes.length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Core Outcomes
            </p>
            <div className="space-y-2">
              {plan.outcomes.slice(0, 2).map((outcome) => (
                <div
                  key={outcome}
                  className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="line-clamp-1">{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button - Enhanced premium feel */}
        <button
          onClick={() => onSelect(plan)}
          className="group/btn relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10">
            {isCompleted ? "Improve Results" : "Master This Path"}
          </span>
          <ChevronRight className="relative z-10 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
