import { useState, useEffect, useCallback } from "react";
import {
  ProblemSolvingTask,
  ProblemSolvingTaskFormData,
} from "@elzatona/types";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  fileType?: string;
}

export { useThemeManagement, usePanelLayout } from "./SharedEditorHooks";

// Form data management hook
export const useFormDataManagement = (task?: ProblemSolvingTask | null) => {
  const [formData, setFormData] = useState<ProblemSolvingTaskFormData>({
    title: "",
    description: "",
    category: "Array",
    difficulty: "easy",
    functionName: "solution",
    starterCode: "",
    solution: "",
    testCases: [],
    constraints: [],
    examples: [],
    tags: [],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "Array",
        difficulty: task.difficulty || "easy",
        functionName: task.functionName || "solution",
        starterCode: task.starterCode || "",
        solution: task.solution || "",
        testCases: task.testCases || [],
        constraints: task.constraints || [],
        examples: task.examples || [],
        tags: task.tags || [],
      });
    }
  }, [task]);

  return { formData, setFormData };
};

// Code editor management hook
export const useCodeEditorManagement = (task?: ProblemSolvingTask | null) => {
  const [starterCode, setStarterCode] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [activeTab, setActiveTab] = useState<"starter" | "solution">("starter");

  useEffect(() => {
    if (task) {
      setStarterCode(task.starterCode || "");
      setSolutionCode(task.solution || "");
    } else {
      const defaultStarterCode = `function solution(nums) {
    // Your code here
    return [];
}`;
      setStarterCode(defaultStarterCode);
    }
  }, [task]);

  return {
    starterCode,
    setStarterCode,
    solutionCode,
    setSolutionCode,
    activeTab,
    setActiveTab,
  };
};

// File explorer management hook
export const useFileExplorerManagement = () => {
  const [activeFile, setActiveFile] = useState<string>("");
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddFile, setShowAddFile] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);

  return {
    activeFile,
    setActiveFile,
    fileTree,
    setFileTree,
    expandedFolders,
    setExpandedFolders,
    openFiles,
    setOpenFiles,
    newFileName,
    setNewFileName,
    newFolderName,
    setNewFolderName,
    showAddFile,
    setShowAddFile,
    showAddFolder,
    setShowAddFolder,
    showFileExplorer,
    setShowFileExplorer,
  };
};

// Dynamic fields management hook
export const useDynamicFieldsManagement = () => {
  const [newConstraint, setNewConstraint] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newTag, setNewTag] = useState("");

  return {
    newConstraint,
    setNewConstraint,
    newExample,
    setNewExample,
    newTag,
    setNewTag,
  };
};
