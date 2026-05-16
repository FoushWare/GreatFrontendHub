"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@elzatona/contexts";

interface AlzatonaLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  variant?: "horizontal" | "stacked";
  forceDarkMode?: boolean; // For cases where we need to force dark mode logo
}

export const AlzatonaLogo: React.FC<AlzatonaLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  variant = "horizontal",
  forceDarkMode = false,
}) => {
  const { isDarkMode } = useTheme();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only using theme after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sizeConfig = {
    xs: { class: "w-20 h-20", width: 80, height: 80 }, // Increased from 16x16
    sm: { class: "w-28 h-28", width: 112, height: 112 }, // Increased from 24x24
    md: { class: "w-36 h-36", width: 144, height: 144 }, // Increased from 32x32
    lg: { class: "w-44 h-44", width: 176, height: 176 }, // Increased from 40x40
  };

  const config = sizeConfig[size];

  // Determine which logo to use based on dark mode
  // Use forceDarkMode as the primary decision factor to avoid hydration issues
  // Only use theme after client-side hydration to prevent mismatches
  const shouldUseDarkLogo = forceDarkMode || (isClient && isDarkMode);
  const logoSrc = shouldUseDarkLogo
    ? "/Elzatona-web01.png"
    : "/Elzatona-black-all.png";
  // Use a consistent alt text to avoid hydration mismatches
  const logoAlt = "Elzatona Logo";

  return (
    <div
      className={`${className} flex items-center ${
        variant === "stacked" ? "flex-col" : "flex-row"
      } ${showText ? "gap-3" : ""}`}
    >
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={config.width}
        height={config.height}
        className={`${config.class} object-contain`}
        priority
        suppressHydrationWarning
      />
      {showText && (
        <div className="leading-tight">
          <div className="text-sm sm:text-base font-semibold tracking-[0.18em] uppercase text-gray-900 dark:text-white">
            Elzatona-web
          </div>
          <div className="text-[0.7rem] sm:text-xs text-gray-500 dark:text-gray-400">
            Learn. Practice. Build.
          </div>
        </div>
      )}
    </div>
  );
};

export default AlzatonaLogo;
