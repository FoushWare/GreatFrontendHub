"use client";

import { LearningPlan } from "../types";
import { LearningPlanCard } from "./LearningPlanCard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

interface PlanSelectionViewProps {
  readonly plans: LearningPlan[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly completedPlans: Set<string>;
  readonly planGrades: Map<string, number>;
  readonly onSelectPlan: (plan: LearningPlan) => void;
}

export function PlanSelectionView({
  plans,
  isLoading,
  error,
  completedPlans,
  planGrades,
  onSelectPlan,
}: Readonly<PlanSelectionViewProps>) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No learning plans available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Completed Plans Summary */}
      {completedPlans.size > 0 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
          <p className="text-green-700 dark:text-green-300 font-medium">
            🎉 You&apos;ve completed {completedPlans.size} plan
            {completedPlans.size > 1 ? "s" : ""}! Keep up the great work!
          </p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <LearningPlanCard
            key={plan.id}
            plan={plan}
            isCompleted={completedPlans.has(plan.id)}
            grade={planGrades.get(plan.id)}
            onSelect={onSelectPlan}
          />
        ))}
      </div>

      {/* Why Guided Learning Section */}
      <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Why Choose Guided Learning?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📚</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Structured Learning
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Follow a proven curriculum designed for optimal learning
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Objective-Driven Stages
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete modular milestones at your own pace without rigid
              deadlines
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏆</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Track Progress
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See your improvement with detailed progress tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
