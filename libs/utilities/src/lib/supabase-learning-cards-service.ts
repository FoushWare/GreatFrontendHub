/* eslint-disable @typescript-eslint/no-explicit-any */
// This file uses 'any' types for Supabase data transformations
import { supabaseClient } from "./supabase";
import type {
  LearningCard,
  LearningCardFormData,
  LearningPlanCard,
  CardProgress,
  CardType,
} from "@elzatona/types";

export class SupabaseLearningCardsService {
  // Learning Cards CRUD operations
  static async getAllCards(): Promise<LearningCard[]> {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }
      const { data: cards, error } = await supabaseClient.getLearningCards({
        isActive: true,
        orderBy: "order_index",
        orderDirection: "asc",
      });

      if (error) {
        throw new Error(error.message);
      }

      // Transform Supabase data to match LearningCard interface
      return (
        cards?.map((card: any) => ({
          id: card.id,
          title: card.title,
          type: card.type as CardType,
          description: card.description,
          color: card.color,
          icon: card.icon,
          order: card.order_index,
          is_active: card.isActive,
          created_at: new Date(card.created_at),
          updated_at: new Date(card.updated_at),
          metadata: {
            question_count: 0, // This would need to be calculated from questions
            estimatedTime: "30 minutes",
            difficulty: "beginner",
            topics: [],
            categories: [],
          },
        })) || []
      );
    } catch (error) {
      console.error("Error fetching learning cards:", error);
      throw error;
    }
  }

  static async getCardById(card_id: string): Promise<LearningCard | null> {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }
      const { data: card, error } = await supabaseClient.getLearningCards({
        isActive: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      const foundCard = card?.find((c: any) => c.id === card_id);
      if (!foundCard) {
        return null;
      }

      // Transform Supabase data to match LearningCard interface
      return {
        id: foundCard.id,
        title: foundCard.title,
        type: foundCard.type as CardType,
        description: foundCard.description,
        color: foundCard.color,
        icon: foundCard.icon,
        order: foundCard.order_index,
        is_active: foundCard.isActive,
        created_at: new Date(foundCard.created_at),
        updated_at: new Date(foundCard.updated_at),
        metadata: {
          question_count: 0, // This would need to be calculated from questions
          estimatedTime: "30 minutes",
          difficulty: "beginner",
          topics: [],
          categories: [],
        },
      };
    } catch (error) {
      console.error("Error fetching learning card:", error);
      throw error;
    }
  }

  static async createCard(cardData: LearningCardFormData): Promise<string> {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }
      // Transform form data to Supabase format
      const supabaseCardData = {
        title: cardData.title,
        type: cardData.type,
        description: cardData.description,
        color: cardData.color || "#3B82F6",
        icon: cardData.icon || "code",
        order_index: cardData.order || 0,
        isActive: cardData.is_active !== false,
      };

      const { data: newCard, error } =
        await supabaseClient.createLearningCard(supabaseCardData);

      if (error) {
        throw new Error(error.message);
      }

      return newCard.id;
    } catch (error) {
      console.error("Error creating learning card:", error);
      throw error;
    }
  }

  static async updateCard(
    card_id: string,
    cardData: Partial<LearningCardFormData>,
  ): Promise<void> {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }
      // Transform form data to Supabase format
      const supabaseCardData: any = {};

      if (cardData.title !== undefined) supabaseCardData.title = cardData.title;
      if (cardData.type !== undefined) supabaseCardData.type = cardData.type;
      if (cardData.description !== undefined)
        supabaseCardData.description = cardData.description;
      if (cardData.color !== undefined) supabaseCardData.color = cardData.color;
      if (cardData.icon !== undefined) supabaseCardData.icon = cardData.icon;
      if (cardData.order !== undefined)
        supabaseCardData.order_index = cardData.order;
      if (cardData.is_active !== undefined)
        supabaseCardData.isActive = cardData.is_active;

      const { error } = await supabaseClient.updateLearningCard(
        card_id,
        supabaseCardData,
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error updating learning card:", error);
      throw error;
    }
  }

  static async deleteCard(card_id: string): Promise<void> {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }
      const { error } = await supabaseClient.deleteLearningCard(card_id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error deleting learning card:", error);
      throw error;
    }
  }

  // Learning Plan Cards operations
  static async getLearningPlanCards(
    _plan_id: string,
  ): Promise<LearningPlanCard[]> {
    // This would need to be implemented based on your learning plan structure
    // For now, return empty array
    return [];
  }

  static async addCardToPlan(plan_id: string, card_id: string): Promise<void> {
    try {
      // This would need to be implemented based on your learning plan structure
      console.log(`Adding card ${card_id} to plan ${plan_id}`);
    } catch (error) {
      console.error("Error adding card to plan:", error);
      throw error;
    }
  }

  static async removeCardFromPlan(
    plan_id: string,
    card_id: string,
  ): Promise<void> {
    try {
      // This would need to be implemented based on your learning plan structure
      console.log(`Removing card ${card_id} from plan ${plan_id}`);
    } catch (error) {
      console.error("Error removing card from plan:", error);
      throw error;
    }
  }

  // Card Progress operations
  static async getCardProgress(
    _userId: string,
    _card_id: string,
  ): Promise<CardProgress | null> {
    // This would need to be implemented based on your progress tracking structure
    // For now, return null
    return null;
  }

  static async updateCardProgress(
    userId: string,
    card_id: string,
    progress: Partial<CardProgress>,
  ): Promise<void> {
    try {
      // This would need to be implemented based on your progress tracking structure
      console.log(
        `Updating progress for user ${userId}, card ${card_id}:`,
        progress,
      );
    } catch (error) {
      console.error("Error updating card progress:", error);
      throw error;
    }
  }

  // Utility methods
  static async getCardsByType(type: CardType): Promise<LearningCard[]> {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }
      const { data: cards, error } = await supabaseClient.getLearningCards({
        type,
        isActive: true,
        orderBy: "order_index",
        orderDirection: "asc",
      });

      if (error) {
        throw new Error(error.message);
      }

      // Transform Supabase data to match LearningCard interface
      return (
        cards?.map((card: any) => ({
          id: card.id,
          title: card.title,
          type: card.type as CardType,
          description: card.description,
          color: card.color,
          icon: card.icon,
          order: card.order_index,
          is_active: card.isActive,
          created_at: new Date(card.created_at),
          updated_at: new Date(card.updated_at),
          metadata: {
            question_count: 0, // This would need to be calculated from questions
            estimatedTime: "30 minutes",
            difficulty: "beginner",
            topics: [],
            categories: [],
          },
        })) || []
      );
    } catch (error) {
      console.error("Error fetching cards by type:", error);
      throw error;
    }
  }

  static async getActiveCardsCount(): Promise<number> {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }
      const { data: cards, error } = await supabaseClient.getLearningCards({
        isActive: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      return cards?.length || 0;
    } catch (error) {
      console.error("Error fetching active cards count:", error);
      throw error;
    }
  }
}
