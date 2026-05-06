"use client";

import React from "react";
import { AnimatedTitle } from "../atoms/AnimatedTitle";
import { CTAButton } from "../atoms/CTAButton";
import { UserStatistics } from "../../common/UserStatistics";
import type { PersonalizedContent } from "@elzatona/types";

interface HeroSectionProps {
  personalizedContent: PersonalizedContent;
  showAnimation: boolean;
}

/**
 * HeroSection Component
 * Main hero section with title, subtitle, CTA button, and user statistics
 */
export function HeroSection({
  personalizedContent,
  showAnimation,
}: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Glassmorphism Hero Card */}
        <div
          className={`relative p-8 md:p-16 rounded-[2.5rem] border border-white/40 dark:border-white/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl shadow-2xl transition-all duration-1000 ${
            showAnimation
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-10">
              <AnimatedTitle
                title={personalizedContent.title}
                highlightText="Interviews"
                showAnimation={showAnimation}
              />

              {/* Animated subtitle with improved typography */}
              <p
                className={`mt-6 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium transition-all duration-700 delay-300 ${
                  showAnimation
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                }`}
              >
                {personalizedContent.subtitle}
              </p>
            </div>

            {/* Animated CTA Button with glow effect */}
            <div
              className={`mb-16 transition-all duration-700 delay-500 ${
                showAnimation ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="relative inline-block group/cta">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover/cta:opacity-50 transition duration-1000 group-hover/cta:duration-200"></div>
                <CTAButton
                  href={personalizedContent.ctaLink}
                  text={personalizedContent.cta}
                  icon={personalizedContent.icon}
                  color={personalizedContent.color}
                  showAnimation={showAnimation}
                />
              </div>
            </div>

            {/* Animated stats with refined container */}
            <div
              className={`pt-10 border-t border-gray-200/50 dark:border-gray-700/50 transition-all duration-700 delay-700 ${
                showAnimation ? "opacity-100" : "opacity-0"
              }`}
            >
              <UserStatistics />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
