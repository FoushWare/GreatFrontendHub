"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Textarea,
} from "../../../components/ui";
import { BookOpen, Search, Plus, Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Topic as AdminTopic, AdminCategory } from "@elzatona/types";

export interface TopicFormData {
  name: string;
  description?: string;
  category_id: string;
}

interface TopicFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  topic: AdminTopic | null;
  categories: AdminCategory[];
  onSubmit: (data: TopicFormData) => Promise<void>;
  onCreateCategory?: (name: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const TopicFormModal: React.FC<TopicFormModalProps> = ({
  isOpen,
  onOpenChange,
  topic,
  categories,
  onSubmit,
  onCreateCategory,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [errors, setErrors] = useState<{ name?: string; categoryId?: string }>(
    {},
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (topic) {
        setName(topic.name || "");
        setDescription(topic.description || "");
        setCategoryId(topic.category_id || "");
      } else {
        setName("");
        setDescription("");
        setCategoryId(categories.length > 0 ? categories[0].id : "");
      }
      setErrors({});
    }
  }, [isOpen, topic, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; categoryId?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!categoryId) newErrors.categoryId = "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId,
    });
    onOpenChange(false);
  };

  let submitButtonText = "Create Topic";
  if (isSubmitting) {
    submitButtonText = "Saving...";
  } else if (topic) {
    submitButtonText = "Save Changes";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl" onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <span>{topic ? "Edit Topic" : "Create Topic"}</span>
          </DialogTitle>
          <DialogDescription>
            {topic
              ? "Update the topic details below."
              : "Add a new topic under a specific category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label
              htmlFor="topic-name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Topic Name
            </label>
            <Input
              id="topic-name"
              placeholder="e.g. React Hooks"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="topic-category"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Parent Category
            </label>
            <Popover
              open={isCategoryPopoverOpen}
              onOpenChange={setIsCategoryPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  id="topic-category"
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCategoryPopoverOpen}
                  className={`w-full justify-between font-normal ${
                    errors.categoryId ? "border-red-500" : ""
                  }`}
                >
                  {categoryId
                    ? categories.find((c) => c.id === categoryId)?.name ||
                      "Select a category"
                    : "Select a category"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {categories
                    .filter((c) =>
                      c.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase()),
                    )
                    .map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className={`flex w-full items-center justify-between px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          categoryId === category.id
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                            : ""
                        }`}
                        aria-pressed={categoryId === category.id}
                        onClick={() => {
                          setCategoryId(category.id);
                          setIsCategoryPopoverOpen(false);
                          if (errors.categoryId)
                            setErrors({ ...errors, categoryId: undefined });
                        }}
                      >
                        <span className="truncate">{category.name}</span>
                        {categoryId === category.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ))}

                  {categorySearch.trim() &&
                    !categories.some(
                      (c) =>
                        c.name.toLowerCase() === categorySearch.toLowerCase(),
                    ) && (
                      <button
                        type="button"
                        className="flex w-full items-center px-2 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded cursor-pointer border-t mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        onClick={async () => {
                          if (onCreateCategory) {
                            await onCreateCategory(categorySearch.trim());
                            setCategorySearch("");
                            // The parent will update 'categories', but we don't know the new ID yet.
                            // We rely on the parent updating 'categories' and potentially triggering the useEffect
                            // to select the latest matching one, or we can just leave it for the user to select.
                            setIsCategoryPopoverOpen(false);
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Create "{categorySearch}"</span>
                      </button>
                    )}

                  {categories.length === 0 && !categorySearch && (
                    <div className="py-6 text-center text-sm text-gray-500">
                      No categories found.
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="topic-description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description (Optional)
            </label>
            <Textarea
              id="topic-description"
              placeholder="Brief description of this topic..."
              className="resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
