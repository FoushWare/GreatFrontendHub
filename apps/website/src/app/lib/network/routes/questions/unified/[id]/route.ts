// v1.1 - Consolidated Single Question API Route
// Now delegates to the shared @elzatona/utilities library.

import { NextRequest } from "next/server";
import {
  questionsGetByIdHandler,
  PUT as questionsPutHandler,
  DELETE as questionsDeleteHandler,
} from "@elzatona/utilities";

/**
 * GET /api/questions/unified/[id] - Get a single question
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return questionsGetByIdHandler(request, { params });
}

/**
 * PUT /api/questions/unified/[id] - Update a single question
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // The PUT handler from the library expects the ID in the body
  return questionsPutHandler(request);
}

/**
 * DELETE /api/questions/unified/[id] - Delete a single question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return questionsDeleteHandler(request);
}
