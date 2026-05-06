"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInPopup } from "@elzatona/common-ui";
import {
  useGuidedLearningAuth,
  useGuidedLearningPlans,
  useActivePlan,
  useCompletedPlans,
} from "./hooks";
import {
  GuidedLearningHeader,
  SignInCTABanner,
  ActivePlanView,
  PlanSelectionView,
} from "./components";

export default function GuidedLearningPage() {
  const router = useRouter();
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  // Custom hooks for clean separation
  const { isAuthenticated, isLoading: authLoading } = useGuidedLearningAuth();
  const {
    plans,
    isLoading: plansLoading,
    error,
    questionsRange,
    milestoneRange,
  } = useGuidedLearningPlans();
  const {
    currentPlan,
    milestones,
    currentMilestoneId,
    resumePlan,
    resetPlan,
    selectPlan,
  } = useActivePlan(isAuthenticated);
  const { completedPlans, planGrades } = useCompletedPlans();

  const handleSignIn = () => {
    setShowSignInPopup(true);
  };

  const handleSignInSuccess = () => {
    setShowSignInPopup(false);
    router.refresh();
  };

  const handleSelectPlan = (plan: Parameters<typeof selectPlan>[0]) => {
    if (!isAuthenticated) {
      setShowSignInPopup(true);
      return;
    }
    selectPlan(plan);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with stats */}
        <GuidedLearningHeader
          questionsRange={questionsRange}
          milestoneRange={milestoneRange}
        />

        {/* Sign-in CTA for non-authenticated users */}
        {!isAuthenticated && <SignInCTABanner onSignIn={handleSignIn} />}

        {/* Active Plan View (if user has a plan in progress) */}
        {isAuthenticated && currentPlan && (
          <ActivePlanView
            plan={currentPlan}
            milestones={milestones}
            currentMilestoneId={currentMilestoneId}
            onResume={resumePlan}
            onReset={resetPlan}
          />
        )}

        {/* Plan Selection Grid */}
        <PlanSelectionView
          plans={plans}
          isLoading={plansLoading}
          error={error}
          completedPlans={completedPlans}
          planGrades={planGrades}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      {/* Sign-in Popup */}
      <SignInPopup
        isOpen={showSignInPopup}
        onClose={() => setShowSignInPopup(false)}
        onSuccess={handleSignInSuccess}
      />
    </div>
  );
}
