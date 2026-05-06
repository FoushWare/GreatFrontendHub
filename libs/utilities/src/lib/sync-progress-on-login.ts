/**
 * Utility function to sync all localStorage progress to database when user logs in
 * v1.0
 */

interface GuidedProgressData {
  planId: string;
  completedQuestions: string[];
  completedTopics: string[];
  completedCategories: string[];
  completedCards: string[];
  correctAnswers?: string[];
  currentPosition: {
    cardIndex: number;
    categoryIndex: number;
    topicIndex: number;
    questionIndex: number;
  };
  lastUpdated: string;
}

interface FreeStyleProgressData {
  lastQuestionIndex: number;
  lastQuestionId?: string;
  answeredQuestions: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answeredQuestionsData?: Record<string, any>;
  lastUpdated: number;
}

/**
 * Helper to scan localStorage for keys with a specific prefix.
 */
function _getLocalStorageKeysByPrefix(prefix: string): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key);
      }
    }
  } catch (err) {
    console.error(`❌ Error scanning localStorage for prefix ${prefix}:`, err);
  }
  return keys;
}

/**
 * Helper loop to sync multiple plans.
 */
async function _syncGuidedPlansLoop(
  keys: string[],
  authToken: string,
  userId?: string,
): Promise<{ syncedCount: number; errors: string[] }> {
  const synced: string[] = [];
  const errors: string[] = [];

  for (const key of keys) {
    const planId = key.replace("guided-practice-progress-", "");
    const result = await _syncSinglePlan(key, planId, authToken, userId);
    if (result.success) {
      synced.push(planId);
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  return { syncedCount: synced.length, errors };
}

export async function syncAllGuidedProgress(
  authToken: string,
  userId?: string,
): Promise<{ success: boolean; synced: number; errors: string[] }> {
  try {
    const guidedKeys = _getLocalStorageKeysByPrefix(
      "guided-practice-progress-",
    );
    console.log(
      `📦 Found ${guidedKeys.length} guided learning progress entries to sync`,
    );

    const { syncedCount, errors } = await _syncGuidedPlansLoop(
      guidedKeys,
      authToken,
      userId,
    );

    return { success: errors.length === 0, synced: syncedCount, errors };
  } catch (error) {
    let errorMsg = "Unknown error";
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === "string") {
      errorMsg = error;
    }

    console.error("❌ Error in syncAllGuidedProgress:", error);
    return { success: false, synced: 0, errors: [errorMsg] };
  }
}

/**
 * Internal helper to sync a single plan's progress.
 */
async function _syncSinglePlan(
  key: string,
  planId: string,
  authToken: string,
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const progressData = localStorage.getItem(key);
    if (!progressData) return { success: false };

    const progress: GuidedProgressData = JSON.parse(progressData);
    const response = await fetch("/api/progress/guided-learning/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        planId,
        completedQuestions: progress.completedQuestions || [],
        completedTopics: progress.completedTopics || [],
        completedCategories: progress.completedCategories || [],
        completedCards: progress.completedCards || [],
        correctAnswers: progress.correctAnswers || [],
        currentPosition: progress.currentPosition,
        lastUpdated: progress.lastUpdated || new Date().toISOString(),
        ...(userId && { userId }),
      }),
    });

    if (response.ok) {
      localStorage.removeItem(key);
      return { success: true };
    }

    const errorData = await response
      .json()
      .catch(() => ({ error: "Sync failed" }));
    return {
      success: false,
      error: `Plan ${planId}: ${errorData.error || "Unknown error"}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Plan ${planId}: ${error instanceof Error ? error.message : "Parse error"}`,
    };
  }
}

/**
 * Sync free-style practice progress from localStorage to database
 * @param authToken - The authentication token (for Authorization header)
 * @param userId - The user ID (to pass in request body for custom auth)
 */
export async function syncFreeStyleProgress(
  authToken: string,
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const progressData = localStorage.getItem("free-style-practice-progress");
    if (!progressData) {
      console.log("📭 No free-style progress found in localStorage");
      return { success: true };
    }

    const progress: FreeStyleProgressData = JSON.parse(progressData);

    const response = await fetch("/api/progress/free-style/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        lastQuestionIndex: progress.lastQuestionIndex,
        lastQuestionId: progress.lastQuestionId,
        answeredQuestions: progress.answeredQuestions || [],
        answeredQuestionsData: progress.answeredQuestionsData || {},
        lastUpdated: progress.lastUpdated
          ? new Date(progress.lastUpdated).toISOString()
          : new Date().toISOString(),
        ...(userId && { userId }), // Pass user ID if provided (for custom auth)
      }),
    });

    if (response.ok) {
      console.log("✅ Synced free-style practice progress");

      // Remove from localStorage after successful sync
      try {
        localStorage.removeItem("free-style-practice-progress");
        console.log("🗑️ Removed free-style progress from localStorage");
      } catch (removeError) {
        console.warn(
          "⚠️ Failed to remove free-style progress from localStorage:",
          removeError,
        );
      }

      return { success: true };
    } else {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("❌ Failed to sync free-style progress:", errorData);
      return { success: false, error: errorData.error || "Sync failed" };
    }
  } catch (error) {
    console.error("❌ Error syncing free-style progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Formats multi-sync results for debugging and display.
 */
function _logSyncResults(guided: any, freeStyle: any, success: boolean): void {
  console.log("📊 Progress sync summary:", {
    guided: { synced: guided.synced, errors: guided.errors.length },
    freeStyle: { success: freeStyle.success },
    overallSuccess: success,
  });
}

/**
 * Sync all progress from localStorage to database
 * This is the main function to call after user login
 */
export async function syncAllProgressOnLogin(
  authToken: string,
  userId?: string,
): Promise<{
  success: boolean;
  guided: { synced: number; errors: string[] };
  freeStyle: { success: boolean; error?: string };
}> {
  console.log("🔄 Starting progress sync on login...", { userId });

  const [guidedResult, freeStyleResult] = await Promise.allSettled([
    syncAllGuidedProgress(authToken, userId),
    syncFreeStyleProgress(authToken, userId),
  ]);

  const guided =
    guidedResult.status === "fulfilled"
      ? guidedResult.value
      : {
          success: false,
          synced: 0,
          errors: [guidedResult.reason?.message || "Unknown error"],
        };

  const freeStyle =
    freeStyleResult.status === "fulfilled"
      ? freeStyleResult.value
      : {
          success: false,
          error: freeStyleResult.reason?.message || "Unknown error",
        };

  const success = guided.success && freeStyle.success;
  _logSyncResults(guided, freeStyle, success);

  return { success, guided, freeStyle };
}
