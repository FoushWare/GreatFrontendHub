// v1.4 - Consolidated Unified Questions API Route
// Now delegates to the shared @elzatona/utilities library to ensure consistency
// and resolve monolithic complexity hotspots.

import { NextRequest } from "next/server";
import {
  questionsGetHandler,
  questionsPostHandler,
  PUT as questionsPutHandler,
  DELETE as questionsDeleteHandler,
} from "@elzatona/utilities";

/**
 * GET /api/questions/unified - Get questions with filters
 * Delegated to library handler.
 */
export async function GET(request: NextRequest) {
  return questionsGetHandler(request);
}

/**
 * POST /api/questions/unified - Create questions (bulk import or single)
 * Delegated to library handler.
 */
export async function POST(request: NextRequest) {
  return questionsPostHandler(request);
}

/**
 * PUT /api/questions/unified - Update a question
 * Delegated to library handler.
 */
export async function PUT(request: NextRequest) {
  return questionsPutHandler(request);
}

/**
 * DELETE /api/questions/unified - Delete a question
 * Delegated to library handler.
 */
export async function DELETE(request: NextRequest) {
  return questionsDeleteHandler(request);
}
