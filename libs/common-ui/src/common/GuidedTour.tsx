"use client";

import React, { useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
const _supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

import { TourProvider, useTour } from "@reactour/tour";

// Guided tour styles are defined statically below
const tourStyles = `
  :root {
    --tour-bg: #ffffff;
    --tour-text: #1f2937;
    --tour-border: #e5e7eb;
    --tour-mask: rgba(0, 0, 0, 0.4);
    --tour-close: #6b7280;
    --tour-accent: #6366f1;
    --tour-accent-hover: #4f46e5;
    --tour-disabled: #9ca3af;
  }

  .dark {
    --tour-bg: #1f2937;
    --tour-text: #f9fafb;
    --tour-border: #374151;
    --tour-mask: rgba(0, 0, 0, 0.6);
    --tour-close: #9ca3af;
    --tour-accent: #6366f1;
    --tour-accent-hover: #4f46e5;
    --tour-disabled: #6b7280;
  }

  .tour-container .reactour__arrow {
    color: var(--tour-bg) !important;
    border: 1px solid var(--tour-border) !important;
  }

  .tour-container .reactour__popover {
    background-color: var(--tour-bg) !important;
    color: var(--tour-text) !important;
    border: 1px solid var(--tour-border) !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
  }

  .tour-container .reactour__close {
    color: var(--tour-close) !important;
  }

  .tour-container .reactour__controls button {
    background-color: var(--tour-accent, #6366f1) !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 8px 16px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
  }

  .tour-container .reactour__controls button:hover {
    background-color: var(--tour-accent-hover, #4f46e5) !important;
    transform: translateY(-1px) !important;
  }

  .tour-container .reactour__controls button:disabled {
    background-color: var(--tour-disabled, #9ca3af) !important;
    cursor: not-allowed !important;
  }
`;

interface GuidedTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    selector: ".hero-title",
    content: (
      <div className="text-center p-4">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: "var(--tour-text)" }}
        >
          Welcome to Elzatona! 🚀
        </h3>
        <p style={{ color: "var(--tour-text)", opacity: 0.8 }}>
          Master frontend development interviews with our comprehensive
          platform. Let me show you around!
        </p>
      </div>
    ),
  },
  {
    selector: ".main-cta-button",
    content: (
      <div className="text-center p-4">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: "var(--tour-text)" }}
        >
          Start Your Journey! 🎯
        </h3>
        <p style={{ color: "var(--tour-text)", opacity: 0.8 }}>
          Click here to choose your learning path - guided or self-directed.
          This is where your interview preparation begins!
        </p>
      </div>
    ),
  },
  {
    selector: ".quick-actions-section",
    content: (
      <div className="text-center p-4">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: "var(--tour-text)" }}
        >
          Quick Actions ⚡
        </h3>
        <p style={{ color: "var(--tour-text)", opacity: 0.8 }}>
          Explore these popular features to jump into learning immediately. Each
          option is designed to help you succeed!
        </p>
      </div>
    ),
  },
  {
    selector: ".get-started-card",
    content: (
      <div className="text-center p-4">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: "var(--tour-text)" }}
        >
          Get Started Card 🌟
        </h3>
        <p style={{ color: "var(--tour-text)", opacity: 0.8 }}>
          This highlighted card is your gateway to the platform. It will guide
          you through choosing your learning style!
        </p>
      </div>
    ),
  },
  {
    selector: ".final-cta-section",
    content: (
      <div className="text-center p-4">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: "var(--tour-text)" }}
        >
          Ready to Begin? 🎉
        </h3>
        <p style={{ color: "var(--tour-text)", opacity: 0.8 }}>
          You&apos;re all set! Click &quot;Start Learning Now&quot; to begin
          your journey or explore the learning paths to see what&apos;s
          available.
        </p>
      </div>
    ),
  },
];

const TourContent: React.FC<GuidedTourProps> = ({
  isOpen,
  onComplete,
  onSkip: _onSkip,
}) => {
  const { setIsOpen, isOpen: tourIsOpen } = useTour();

  React.useEffect(() => {
    if (isOpen) {
      setIsOpen(true);
    }
  }, [isOpen, setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onComplete();
  }, [setIsOpen, onComplete]);

  return null; // The tour is handled by TourProvider
};

export const GuidedTour: React.FC<GuidedTourProps> = (props) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: tourStyles,
        }}
      />
      <TourProvider
        steps={steps}
        styles={{
          popover: (base) => ({
            ...base,
            "--reactour-accent": "#6366f1",
            borderRadius: 12,
            padding: 20,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            backgroundColor: "var(--tour-bg, #ffffff)",
            color: "var(--tour-text, #1f2937)",
            border: "1px solid var(--tour-border, #e5e7eb)",
            textAlign: "left",
          }),
          maskArea: (base) => ({ ...base, rx: 12 }),
          maskWrapper: (base) => ({
            ...base,
            color: "var(--tour-mask, rgba(0, 0, 0, 0.4))",
          }),
          badge: (base) => ({
            ...base,
            left: "auto",
            right: "-0.8125em",
            backgroundColor: "#6366f1",
            color: "#ffffff",
          }),
          controls: (base) => ({
            ...base,
            marginTop: 20,
            flexDirection: "row",
          }),
          close: (base) => ({
            ...base,
            right: "auto",
            left: 8,
            top: 8,
            color: "var(--tour-close, #6b7280)",
          }),
        }}
        padding={10}
        className="tour-container"
      >
        <TourContent {...props} />
      </TourProvider>
    </>
  );
};
