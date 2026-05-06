import { useState, useEffect, useCallback } from "react";
import { AdminFrontendTask, AdminFrontendTaskFormData } from "@elzatona/types";

type SupportedFileType = "tsx" | "css" | "html" | "js" | "json";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  fileType?: string;
  isEntryPoint?: boolean;
}

export {
  useThemeManagement,
  usePanelLayout,
  useConsoleManagement,
} from "./SharedEditorHooks";

// Hook for form data management
export const useFormDataManagement = (task?: AdminFrontendTask | null) => {
  const [formData, setFormData] = useState<AdminFrontendTaskFormData>({
    title: "",
    description: "",
    requirements: "",
    solution: "",
    category: "react",
    difficulty: "easy",
    estimatedTime: 30,
    author: "",
    starterCode: "",
    tags: [],
    hints: [],
    files: [],
    is_active: true,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        requirements: task.requirements || "",
        solution: task.solution || "",
        category: task.category || "react",
        difficulty: task.difficulty || "easy",
        estimatedTime: task.estimatedTime || 30,
        author: task.author || "",
        starterCode: task.starterCode || "",
        tags: task.tags || [],
        hints: task.hints || [],
        files: task.files || [],
        is_active: task.is_active !== false,
      });
    }
  }, [task]);

  return { formData, setFormData };
};

// Helper function to create file tree structure
const createFileTree = (files: Array<FileNode & { fileType?: string }>) => {
  return [
    {
      id: "src",
      name: "src",
      type: "folder" as const,
      children: files.filter(
        (f) => f.fileType !== "html" && f.fileType !== "json",
      ),
    },
    {
      id: "public",
      name: "public",
      type: "folder" as const,
      children: files.filter((f) => f.fileType === "html"),
    },
    {
      id: "root",
      name: "Root",
      type: "folder" as const,
      children: files.filter((f) => f.fileType === "json"),
    },
  ];
};

// Helper function to create default files
const createDefaultFiles = () => {
  return [
    {
      id: "app",
      name: "App.tsx",
      type: "file" as const,
      fileType: "tsx",
      content: "",
    },
    {
      id: "styles",
      name: "styles.css",
      type: "file" as const,
      fileType: "css",
      content: "",
    },
    {
      id: "index",
      name: "index.html",
      type: "file" as const,
      fileType: "html",
      content:
        '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>',
    },
  ];
};

// Helper function to initialize from task files
const initializeFromTask = (task: AdminFrontendTask) => {
  const files = task.files.map((file) => ({
    id: file.id,
    name: file.name,
    type: "file" as const,
    content: file.content,
    fileType: file.type,
    isEntryPoint: file.isEntryPoint,
  }));

  return {
    fileTree: createFileTree(files),
    openFiles: files.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.fileType as SupportedFileType,
      content: f.content,
    })),
    activeFile: files.find((f) => f.isEntryPoint)?.id || files[0]?.id || null,
    expandedFolders: new Set(["src", "public", "root"]),
  };
};

// Helper function to initialize default files
const initializeDefaults = () => {
  const defaultFiles = createDefaultFiles();

  return {
    fileTree: [
      {
        id: "src",
        name: "src",
        type: "folder" as const,
        children: defaultFiles.filter((f) => f.fileType !== "html"),
      },
      {
        id: "public",
        name: "public",
        type: "folder" as const,
        children: defaultFiles.filter((f) => f.fileType === "html"),
      },
    ],
    openFiles: defaultFiles.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.fileType as "tsx" | "css" | "html" | "js" | "json",
      content: f.content,
    })),
    activeFile: "app",
    expandedFolders: new Set(["src", "public"]),
  };
};

// Hook for file management
export const useFileManagement = (task?: AdminFrontendTask | null) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [openFiles, setOpenFiles] = useState<
    Array<{
      id: string;
      name: string;
      type: "tsx" | "css" | "html" | "js" | "json";
      content: string;
    }>
  >([]);
  const [showFileExplorer, setShowFileExplorer] = useState(true);

  // Initialize file tree and open files
  useEffect(() => {
    if (task?.files && task.files.length > 0) {
      const {
        fileTree: tree,
        openFiles: files,
        activeFile: active,
        expandedFolders: folders,
      } = initializeFromTask(task);
      setFileTree(tree);
      setOpenFiles(files);
      setActiveFile(active);
      setExpandedFolders(folders);
    } else {
      const {
        fileTree: tree,
        openFiles: files,
        activeFile: active,
        expandedFolders: folders,
      } = initializeDefaults();
      setFileTree(tree);
      setOpenFiles(files);
      setActiveFile(active);
      setExpandedFolders(folders);
    }
  }, [task]);

  return {
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
  };
};
