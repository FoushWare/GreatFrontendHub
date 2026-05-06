"use client";

import React from "react";
import { Editor } from "@monaco-editor/react";
import {
  ProblemSolvingTask,
  ProblemSolvingTaskFormData,
} from "@elzatona/types";
import ClientCodeRunner from "./ClientCodeRunner";
import {
  useThemeManagement,
  useFormDataManagement,
  useCodeEditorManagement,
  useFileExplorerManagement,
  useDynamicFieldsManagement,
  usePanelLayout,
} from "./ProblemSolvingEditorHooks";
import {
  ProblemSolvingEditorHeader,
  ProblemSolvingEditorMainContent,
} from "./ProblemSolvingEditorComponents";
import {
  createTestCase,
  validateFormData,
  copyToClipboard,
  addConstraint,
  removeConstraint,
  addExample,
  removeExample,
  addTag,
  removeTag,
} from "./ProblemSolvingEditorUtils";

interface ProblemSolvingEditorProps {
  task?: ProblemSolvingTask | null;
  onSave: (taskData: ProblemSolvingTaskFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

// Custom hook to consolidate all problem solving editor state management
const useProblemSolvingEditorState = (task?: ProblemSolvingTask | null) => {
  // Extracted hooks for state management
  const { theme, setTheme, isDark } = useThemeManagement();
  const { formData, setFormData } = useFormDataManagement(task);
  const {
    starterCode,
    setStarterCode,
    solutionCode,
    setSolutionCode,
    activeTab,
    setActiveTab,
  } = useCodeEditorManagement(task);
  const { leftPanelWidth, rightPanelWidth, handleMouseDown } = usePanelLayout();

  return {
    // Theme management
    theme,
    setTheme,
    isDark,
    // Form data
    formData,
    setFormData,
    // Code editor management
    starterCode,
    setStarterCode,
    solutionCode,
    setSolutionCode,
    activeTab,
    setActiveTab,
    // Panel layout
    leftPanelWidth,
    rightPanelWidth,
    handleMouseDown,
  };
};

export default function ProblemSolvingEditor({
  task,
  onSave,
  onCancel,
  isEditing = false,
}: ProblemSolvingEditorProps) {
  const editorState = useProblemSolvingEditorState(task);
  const {
    theme,
    setTheme,
    isDark,
    formData,
    setFormData,
    starterCode,
    setStarterCode,
    solutionCode,
    setSolutionCode,
    activeTab,
    setActiveTab,
    leftPanelWidth,
    rightPanelWidth,
    handleMouseDown,
  } = editorState;

  // Simple form handlers
  const handleSave = () => {
    const errors = validateFormData(formData);
    if (errors.length > 0) {
      console.error("Validation errors:", errors);
      return;
    }

    const updatedFormData = {
      ...formData,
      starterCode,
      solution: solutionCode,
    };

    onSave(updatedFormData);
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <ProblemSolvingEditorHeader
        isDark={isDark}
        theme={theme}
        setTheme={setTheme}
        isEditing={isEditing}
        formData={formData}
        handleSave={handleSave}
        onCancel={onCancel}
      />
      <ProblemSolvingEditorMainContent
        isDark={isDark}
        leftPanelWidth={leftPanelWidth}
        rightPanelWidth={rightPanelWidth}
        handleMouseDown={handleMouseDown}
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as "starter" | "solution")}
        formData={formData}
        setFormData={setFormData}
      >
        <div className="h-full">
          <Editor
            height="100%"
            language="javascript"
            value={activeTab === "starter" ? starterCode : solutionCode}
            onChange={(value) => {
              if (activeTab === "starter") {
                setStarterCode(value || "");
              } else {
                setSolutionCode(value || "");
              }
            }}
            theme={isDark ? "vs-dark" : "vs-light"}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </ProblemSolvingEditorMainContent>
    </div>
  );
}
