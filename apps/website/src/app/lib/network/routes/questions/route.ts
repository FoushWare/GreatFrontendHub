// v1.1 - Consolidated Questions API Route
// Now delegates to the shared @elzatona/utilities library.

import { NextRequest } from "next/server";
import { questionsGetHandler, questionsPostHandler } from "@elzatona/utilities";

/**
 * GET /api/questions - Get questions with filters
 */
export async function GET(request: NextRequest) {
  return questionsGetHandler(request);
}

/**
 * POST /api/questions - Create a new question
 */
export async function POST(request: NextRequest) {
  return questionsPostHandler(request);
}
