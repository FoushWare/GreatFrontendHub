"use client";

// ...existing code...
import React from "react";
import { AdminFrontendTask, AdminFrontendTaskFormData } from "@elzatona/types";
import {
  useThemeManagement,
  useFormDataManagement,
  usePanelLayout,
  useFileManagement,
  useConsoleManagement,
} from "./FrontendTaskEditorHooks";
import {
  FrontendTaskEditorHeader,
  FrontendTaskEditorMainContent,
} from "./FrontendTaskEditorComponents";
import {} from // ...existing code...
"./FrontendTaskEditorUtils";

interface FrontendTaskEditorProps {
  readonly task?: AdminFrontendTask | null;
  readonly onSave: (taskData: AdminFrontendTaskFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly mode?: "create" | "edit" | "view";
}

// Custom hook to consolidate all editor state management
const useFrontendTaskEditorState = (task?: AdminFrontendTask | null) => {
  // Extracted hooks for state management
  const { theme, setTheme, isDark } = useThemeManagement();
  const { formData, setFormData } = useFormDataManagement(task);
  const { leftPanelWidth, rightPanelWidth, handleMouseDown } = usePanelLayout();
  const {
    activeFile,
    fileTree,
    expandedFolders,
    openFiles,
    showFileExplorer,
    setActiveFile,
    setFileTree,
    setExpandedFolders,
    setOpenFiles,
    setShowFileExplorer,
  } = useFileManagement(task);
  const { consoleOutput, setConsoleOutput } = useConsoleManagement();

  // Minimal local state
  const [copied, setCopied] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"description" | "solution">(
    "description",
  );
  const [activeBrowserTab, setActiveBrowserTab] = React.useState<
    "browser" | "console"
  >("browser");
  const [newHint, setNewHint] = React.useState("");
  const [newTag, setNewTag] = React.useState("");
  const [newFileName, setNewFileName] = React.useState("");
  const [newFolderName, setNewFolderName] = React.useState("");
  const [showAddFile, setShowAddFile] = React.useState(false);
  const [showAddFolder, setShowAddFolder] = React.useState(false);

  return {
    // Theme management
    theme,
    setTheme,
    isDark,
    // Form data management
    formData,
    setFormData,
    // Panel layout
    leftPanelWidth,
    rightPanelWidth,
    handleMouseDown,
    // File management
    activeFile,
    fileTree,
    expandedFolders,
    openFiles,
    showFileExplorer,
    setActiveFile,
    setFileTree,
    setExpandedFolders,
    setOpenFiles,
    setShowFileExplorer,
    // Console management
    consoleOutput,
    setConsoleOutput,
    // Local state
    copied,
    setCopied,
    showPreview,
    setShowPreview,
    activeTab,
    setActiveTab,
    activeBrowserTab,
    setActiveBrowserTab,
    newHint,
    setNewHint,
    newTag,
    setNewTag,
    newFileName,
    setNewFileName,
    newFolderName,
    setNewFolderName,
    showAddFile,
    setShowAddFile,
    showAddFolder,
    setShowAddFolder,
  };
};

export default function FrontendTaskEditor({
  task,
  onSave,
  onCancel,
  mode = "create",
}: FrontendTaskEditorProps) {
  const editorState = useFrontendTaskEditorState(task);
  const {
    theme,
    setTheme,
    isDark,
    formData,
    setFormData,
    leftPanelWidth,
    rightPanelWidth,
    handleMouseDown,
    showFileExplorer,
    setShowFileExplorer,
    showPreview,
    activeTab,
    setActiveTab,
    activeBrowserTab,
  } = editorState;

  // Simple form handlers
  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <FrontendTaskEditorHeader
        isDark={isDark}
        theme={theme}
        setTheme={setTheme}
        mode={mode}
        formData={formData}
        handleSave={handleSave}
        onCancel={onCancel}
      />
      <FrontendTaskEditorMainContent
        isDark={isDark}
        leftPanelWidth={leftPanelWidth}
        rightPanelWidth={rightPanelWidth}
        handleMouseDown={handleMouseDown}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        setFormData={setFormData}
        mode={mode}
        showFileExplorer={showFileExplorer}
        setShowFileExplorer={setShowFileExplorer}
      />
    </div>
  );
}
