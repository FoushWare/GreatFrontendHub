"use client";

import React from "react";
import { useUserType } from "@elzatona/contexts";
import { Compass, Map } from "lucide-react";

interface LearningModeSwitcherProps {
  isScrolled?: boolean;
}

/**
 * LearningModeSwitcher
 * A premium, glassmorphism-inspired toggle for switching between Guided and Free Style learning.
 */
export const LearningModeSwitcher: React.FC<LearningModeSwitcherProps> = ({
  isScrolled,
}) => {
  const { userType, setUserType } = useUserType();

  const isGuided = userType === "guided";
  const isSelfDirected = !isGuided;

  // Determine text colors based on state to avoid nested ternaries in JSX
  const getGuidedTextColor = () => {
    if (isGuided) {
      return isScrolled ? "text-white" : "text-indigo-900 dark:text-white";
    }
    return isScrolled
      ? "text-gray-500 hover:text-gray-700 dark:text-gray-400"
      : "text-white/70 hover:text-white";
  };

  const getSelfDirectedTextColor = () => {
    if (isSelfDirected) {
      return isScrolled ? "text-white" : "text-indigo-900 dark:text-white";
    }
    return isScrolled
      ? "text-gray-500 hover:text-gray-700 dark:text-gray-400"
      : "text-white/70 hover:text-white";
  };

  const containerClasses = isScrolled
    ? "bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-inner"
    : "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg";

  const pillClasses = isScrolled
    ? "bg-indigo-600"
    : "bg-white/90 dark:bg-indigo-500";

  return (
    <div
      aria-label="Learning Mode Selection"
      className={`relative flex items-center p-1 rounded-xl transition-all duration-300 ${containerClasses}`}
    >
      {/* Active Background Pill */}
      <div
        className={`absolute inset-y-1 transition-all duration-500 ease-out rounded-lg shadow-md ${
          isGuided ? "left-1 right-1/2" : "left-1/2 right-1"
        } ${pillClasses}`}
      />

      {/* Guided Option */}
      <button
        onClick={() => setUserType("guided")}
        aria-pressed={isGuided}
        className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-1.5 rounded-lg transition-colors duration-300 ${getGuidedTextColor()}`}
      >
        <Compass size={16} className={isGuided ? "animate-pulse" : ""} />
        <span className="text-sm font-semibold whitespace-nowrap">Guided</span>
      </button>

      {/* Free Style Option */}
      <button
        onClick={() => setUserType("self-directed")}
        aria-pressed={isSelfDirected}
        className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-1.5 rounded-lg transition-colors duration-300 ${getSelfDirectedTextColor()}`}
      >
        <Map size={16} className={isSelfDirected ? "animate-pulse" : ""} />
        <span className="text-sm font-semibold whitespace-nowrap">
          Free Style
        </span>
      </button>
    </div>
  );
};
