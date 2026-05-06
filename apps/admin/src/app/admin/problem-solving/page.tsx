"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Terminal, Layout, Edit } from "lucide-react";
import {
  ProblemSolvingTask,
  ProblemSolvingTaskFormData,
} from "@elzatona/types";
import {
  ProblemSolvingEditor,
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  useToast,
} from "@elzatona/common-ui";

export default function ProblemSolvingPage() {
  const [tasks, setTasks] = useState<ProblemSolvingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProblemSolvingTask | null>(
    null,
  );
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const { showSuccess, showError } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/problem-solving");
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showError("Error", "Failed to load problem solving tasks");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setEditorMode("create");
    setIsEditorOpen(true);
  };

  const handleEditTask = (task: ProblemSolvingTask) => {
    setSelectedTask(task);
    setEditorMode("edit");
    setIsEditorOpen(true);
  };

  const handleSaveTask = async (taskData: ProblemSolvingTaskFormData) => {
    try {
      const url =
        editorMode === "create"
          ? "/api/admin/problem-solving"
          : `/api/admin/problem-solving/${selectedTask?.id}`;

      const method = editorMode === "create" ? "POST" : "PUT";

      console.log("Saving task:", taskData);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          "Success",
          `Task ${editorMode === "create" ? "created" : "updated"} successfully`,
        );
        setIsEditorOpen(false);
        fetchTasks();
      } else {
        throw new Error(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      showError("Error", "Failed to save task");
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Terminal className="h-8 w-8 text-green-600" />
            Problem Solving
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage algorithmic coding challenges
          </p>
        </div>
        <Button
          onClick={handleCreateTask}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <output
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"
            aria-label="Loading"
          ></output>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Get started by creating your first problem solving task
          </p>
          <Button onClick={handleCreateTask} variant="outline">
            Create Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant={
                      task.difficulty === "easy"
                        ? "secondary"
                        : task.difficulty === "medium"
                          ? "default" /* default usually blue/primary */
                          : "destructive"
                    }
                    className={
                      task.difficulty === "medium"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : ""
                    }
                  >
                    {task.difficulty}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4 text-gray-500 hover:text-green-600" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-3 line-clamp-1">
                  {task.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {task.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-400 mt-auto">
                  <span>{task.category}</span>
                  <span>{task.examples?.length || 0} Examples</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {task.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {(task.tags?.length || 0) > 3 && (
                    <span className="text-xs text-gray-400 self-center">
                      +{task.tags!.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <ProblemSolvingEditor
          task={selectedTask}
          onSave={handleSaveTask}
          onCancel={() => setIsEditorOpen(false)}
          isEditing={editorMode === "edit"}
        />
      )}
    </div>
  );
}
