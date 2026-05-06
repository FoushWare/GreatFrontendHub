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
  const fileExplorerState = useFileExplorerManagement();
  const dynamicFieldsState = useDynamicFieldsManagement();
  const { leftPanelWidth, rightPanelWidth, handleMouseDown } = usePanelLayout();

  // Minimal local state
  const [copied, setCopied] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(true);
  const [activeBrowserTab, setActiveBrowserTab] = React.useState<
    "browser" | "console"
  >("browser");

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
    // File explorer and dynamic fields
    fileExplorerState,
    dynamicFieldsState,
    // Panel layout
    leftPanelWidth,
    rightPanelWidth,
    handleMouseDown,
    // Local state
    copied,
    setCopied,
    showPreview,
    setShowPreview,
    activeBrowserTab,
    setActiveBrowserTab,
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
    dynamicFieldsState,
    leftPanelWidth,
    rightPanelWidth,
    handleMouseDown,
    copied,
    setCopied,
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

  const handleCopyCode = async (code: string) => {
    try {
      await copyToClipboard(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleAddTestCase = () => {
    const newTestCase = createTestCase();
    setFormData({
      ...formData,
      testCases: [...formData.testCases, newTestCase],
    });
  };

  const handleRemoveTestCase = (index: number) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index),
    });
  };

  const handleUpdateTestCase = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedTestCases = [...formData.testCases];
    updatedTestCases[index] = {
      ...updatedTestCases[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      testCases: updatedTestCases,
    });
  };

  const handleAddConstraint = () => {
    const updatedConstraints = addConstraint(
      formData.constraints,
      dynamicFieldsState.newConstraint,
    );
    setFormData({
      ...formData,
      constraints: updatedConstraints,
    });
    dynamicFieldsState.setNewConstraint("");
  };

  const handleAddExample = () => {
    const updatedExamples = addExample(
      formData.examples,
      dynamicFieldsState.newExample,
    );
    setFormData({
      ...formData,
      examples: updatedExamples,
    });
    dynamicFieldsState.setNewExample("");
  };

  const handleAddTag = () => {
    const updatedTags = addTag(formData.tags, dynamicFieldsState.newTag);
    setFormData({
      ...formData,
      tags: updatedTags,
    });
    dynamicFieldsState.setNewTag("");
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
