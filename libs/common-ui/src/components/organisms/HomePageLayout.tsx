"use client";

import React from "react";
import { AnimatedBackground } from "../molecules/AnimatedBackground";
import { HeroSection } from "../molecules/HeroSection";
import { LearningStyleSelector } from "../molecules/LearningStyleSelector";
import { PersonalizedContent } from "./PersonalizedContent";
import { FinalCTASection } from "./FinalCTASection";
import type {
  UserType,
  ActivePlan,
  PersonalizedContent as PersonalizedContentType,
} from "@elzatona/types";

interface HomePageLayoutProps {
  userType: UserType;
  showAnimation: boolean;
  hasActivePlan: boolean;
  activePlan: ActivePlan | null;
  personalizedContent: PersonalizedContentType;
  onGuidedClick: () => void;
  onFreestyleClick: () => void;
}

/**
 * HomePageLayout Component
 * Overall page layout structure for the home page
 */
export function HomePageLayout({
  userType,
  showAnimation,
  hasActivePlan,
  activePlan,
  personalizedContent,
  onGuidedClick,
  onFreestyleClick,
}: HomePageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b] relative overflow-hidden">
      {/* Subtle depth layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />

      <AnimatedBackground />

      <div className="relative z-10 space-y-24 pb-32">
        <HeroSection
          personalizedContent={personalizedContent}
          showAnimation={showAnimation}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <LearningStyleSelector
            userType={userType}
            onGuidedClick={onGuidedClick}
            onFreestyleClick={onFreestyleClick}
            showAnimation={showAnimation}
          />
        </div>

        {userType && (
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <PersonalizedContent
              userType={userType}
              showAnimation={showAnimation}
              hasActivePlan={hasActivePlan}
              activePlan={activePlan}
              personalizedContent={personalizedContent}
            />
          </div>
        )}

        {!userType && (
          <div className="max-w-4xl mx-auto px-4">
            <FinalCTASection showAnimation={showAnimation} />
          </div>
        )}
      </div>
    </div>
  );
}
