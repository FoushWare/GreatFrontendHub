// v1.1 - Consolidated Admin Questions API Route
// Delegates to the shared @elzatona/utilities library.

import { NextRequest } from "next/server";
import { questionsGetHandler, questionsPostHandler } from "@elzatona/utilities";

/**
 * GET /api/admin/questions/unified - Get questions with filters
 */
export async function GET(request: NextRequest) {
  return questionsGetHandler(request);
}

/**
 * POST /api/admin/questions/unified - Create question
 */
export async function POST(request: NextRequest) {
  return questionsPostHandler(request);
}
