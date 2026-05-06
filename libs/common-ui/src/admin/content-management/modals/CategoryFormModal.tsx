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
import { FolderOpen } from "lucide-react";
import { AdminCategory } from "@elzatona/types";

export interface CategoryFormData {
  name: string;
  description?: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminCategory | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onOpenChange,
  category,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || "");
        setDescription(category.description || "");
      } else {
        setName("");
        setDescription("");
      }
      setErrors({});
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }

    await onSubmit({ name: name.trim(), description: description.trim() });
    onOpenChange(false);
  };

  let submitButtonText = "Create Category";
  if (isSubmitting) {
    submitButtonText = "Saving...";
  } else if (category) {
    submitButtonText = "Save Changes";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl" onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-green-600" />
            <span>{category ? "Edit Category" : "Create Category"}</span>
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update the category details below."
              : "Add a new category to organize your learning topics."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Category Name
            </label>
            <Input
              id="category-name"
              placeholder="e.g. Frontend Development"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({});
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category-description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description (Optional)
            </label>
            <Textarea
              id="category-description"
              placeholder="Brief description of this category..."
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
