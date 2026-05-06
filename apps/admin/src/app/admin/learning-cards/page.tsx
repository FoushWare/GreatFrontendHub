"use client";

import React, { useState } from "react";
import {
  AdminNavbar,
  LearningCardsManager,
  DeleteConfirmationModal,
} from "@elzatona/common-ui";
import { useLearningCards } from "./hooks/useLearningCards";
import { AdminLearningCard } from "@elzatona/types";
import CardFormModal from "./components/CardFormModal";

export default function LearningCardsPage() {
  const {
    cards,
    categories,
    topics,
    questions,
    stats,
    loading,
    error,
    expandedCards,
    toggleCard,
    expandedCategories,
    toggleCategory,
    expandedTopics,
    toggleTopic,
    createCard,
    updateCard,
    deleteCard,
  } = useLearningCards();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AdminLearningCard | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<AdminLearningCard | null>(
    null,
  );

  const handleCreateCard = () => {
    setEditingCard(null);
    setIsFormModalOpen(true);
  };

  const handleEditCard = (card: AdminLearningCard) => {
    setEditingCard(card);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (card: AdminLearningCard) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (cardToDelete) {
      const success = await deleteCard(cardToDelete.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setCardToDelete(null);
      }
    }
  };

  const handleFormSubmit = async (data: Partial<AdminLearningCard>) => {
    if (editingCard) {
      await updateCard(editingCard.id, data);
    } else {
      await createCard(data);
    }
    setIsFormModalOpen(false);
  };

  // Unsupported actions in this specific view for now (managed in main Content Management)
  const handleEditCategories = () => {
    // Redirect or show message that this is handled in Content Management
  };

  if (loading && cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center">
          <output
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            aria-label="Loading"
          ></output>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <LearningCardsManager
            cards={cards}
            categories={categories}
            topics={topics}
            questions={questions}
            stats={stats}
            expandedCards={expandedCards}
            toggleCard={toggleCard}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            expandedTopics={expandedTopics}
            toggleTopic={toggleTopic}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteClick}
            onCreateCard={handleCreateCard}
            onEditCategories={handleEditCategories}
          />
        </div>
      </main>

      <CardFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingCard={editingCard}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Learning Card"
        description="This action will remove the card and may affect nested categories."
        itemName={cardToDelete?.title || ""}
        isDeleting={false}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
