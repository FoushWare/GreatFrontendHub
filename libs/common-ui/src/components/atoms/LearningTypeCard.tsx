"use client";

import React from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "../../utils";

type ColorVariant = "indigo" | "green";

interface LearningTypeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  isSelected?: boolean;
  showAnimation?: boolean;
  animationDelay?: string;
  colorVariant: ColorVariant;
  className?: string;
}

const colorVariants = {
  indigo: {
    gradient:
      "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
    iconBg: "bg-indigo-600",
    ring: "ring-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    hoverText:
      "group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400",
  },
  green: {
    gradient:
      "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    iconBg: "bg-green-600",
    ring: "ring-green-400",
    text: "text-green-600 dark:text-green-400",
    hoverText:
      "group-hover/card:text-green-600 dark:group-hover/card:text-green-400",
  },
};

/**
 * LearningTypeCard Component
 * Card for selecting learning type (Guided or Free Style)
 */
export function LearningTypeCard({
  title,
  description,
  icon: Icon,
  onClick,
  isSelected = false,
  showAnimation = true,
  animationDelay = "0ms",
  colorVariant,
  className = "",
}: LearningTypeCardProps) {
  const colors = colorVariants[colorVariant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group/card bg-gradient-to-br rounded-2xl p-8 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer",
        colors.gradient,
        showAnimation
          ? "opacity-100 translate-y-0"
          : "opacity-100 translate-y-0",
        isSelected && `ring-2 ${colors.ring} ring-opacity-50 shadow-lg`,
        className,
      )}
      style={{ transitionDelay: animationDelay }}
    >
      <div className="text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover/card:scale-110 transition-transform duration-300",
            colors.iconBg,
          )}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3
          className={cn(
            "text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors",
            colors.hoverText,
          )}
        >
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 group-hover/card:text-gray-700 dark:group-hover/card:text-gray-200 transition-colors">
          {description}
        </p>
        <div
          className={cn(
            "flex items-center justify-center space-x-2 font-medium",
            colors.text,
          )}
        >
          <span>Start {title}</span>
          <ArrowRight className="w-5 h-5 group-hover/card:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
}
