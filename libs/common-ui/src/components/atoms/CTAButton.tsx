"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getColorClasses } from "@elzatona/utilities/client";
import type { ContentColor } from "@elzatona/types";

interface CTAButtonProps {
  href: string;
  text: string;
  icon?: React.ReactNode;
  color: ContentColor;
  showAnimation?: boolean;
  className?: string;
  variant?: "gradient" | "solid";
}

/**
 * CTAButton Component
 * Call-to-action button with gradient effects and animations
 */
export function CTAButton({
  href,
  text,
  icon,
  color,
  showAnimation = true,
  className = "",
  variant = "gradient",
}: CTAButtonProps) {
  const baseClasses =
    "group inline-flex items-center space-x-3 px-8 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden";

  const gradientClasses = `bg-gradient-to-r ${getColorClasses(color)}`;
  const solidClasses = `bg-${color}-600 hover:bg-${color}-700`;

  return (
    <div
      className={`transition-all duration-300 ${
        showAnimation
          ? "opacity-100 translate-y-0"
          : "opacity-100 translate-y-0"
      } ${className}`}
    >
      <div className="relative inline-block">
        <Link
          href={href}
          className={`${baseClasses} ${
            variant === "gradient" ? gradientClasses : solidClasses
          } group/button`}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"></div>

          <span className="relative z-10 flex items-center space-x-2">
            {icon && <span>{icon}</span>}
            <span>{text}</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-1" />
          </span>
        </Link>
      </div>
    </div>
  );
}
