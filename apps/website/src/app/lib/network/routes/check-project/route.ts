import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getSupabaseConfig } from "../../../api-config";
import { getEnvironment } from "../../../environment";

const adminConfig = {
  get jwtSecret() {
    return process.env.JWT_SECRET || "default-secret";
  },
};

export async function GET(request: NextRequest) {
  try {
    const auth = _verifyAdminAuth(request);
    if (!auth.success)
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 },
      );

    const config = getSupabaseConfig();
    const env = getEnvironment();

    const urlProjectRef = config.url.match(
      /https?:\/\/([^.]+)\.supabase\.co/,
    )?.[1];
    const { ref: keyProjectRef, role: keyRole } = _decodeServiceKey(
      config.serviceRoleKey,
    );

    const projectData = _getProjectStatus(urlProjectRef, keyProjectRef);

    return NextResponse.json({
      success: true,
      environment: {
        detected: env,
        appEnv: process.env.APP_ENV,
        nodeEnv: process.env.NODE_ENV,
      },
      supabase: {
        url: config.url,
        urlProjectRef: urlProjectRef || "not found",
        ...projectData.supabase,
        keyProjectRef: keyProjectRef || "not found",
        keyRole: keyRole || "unknown",
        match: projectData.isMatch,
      },
      status: projectData.status,
      message: projectData.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 },
    );
  }
}

function _verifyAdminAuth(request: NextRequest): {
  success: boolean;
  error?: string;
} {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return { success: false, error: "Unauthorized: Admin token required" };
  try {
    const decoded = jwt.verify(token, adminConfig.jwtSecret) as any;
    if (!decoded.adminId && !decoded.id)
      return { success: false, error: "Unauthorized: Invalid admin token" };
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized: Invalid or expired token" };
  }
}

function _decodeServiceKey(key?: string): { ref?: string; role?: string } {
  if (!key) return {};
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return {};
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return { ref: payload.ref, role: payload.role };
  } catch {
    return {};
  }
}

function _getProjectStatus(urlRef?: string, keyRef?: string) {
  const projects: any = {
    kiycimlsatwfqxtfprlr: { name: "zatona-web-testing", type: "TEST" },
    hpnewqkvpnthpohvxcmq: { name: "zatona-web", type: "PRODUCTION" },
  };
  const urlP = projects[urlRef || ""] || { name: "unknown", type: "UNKNOWN" };
  const keyP = projects[keyRef || ""] || { name: "unknown", type: "UNKNOWN" };
  const isMatch = urlRef === keyRef;
  const isTest = urlRef === "kiycimlsatwfqxtfprlr";
  const isProd = urlRef === "hpnewqkvpnthpohvxcmq";

  return {
    isMatch,
    supabase: {
      urlProjectName: urlP.name,
      urlProjectType: urlP.type,
      keyProjectName: keyP.name,
      keyProjectType: keyP.type,
    },
    status: {
      isTestProject: isTest,
      isProductionProject: isProd,
      isCorrectlyConfigured: isMatch && (isTest || isProd),
    },
    message: _getProjectMessage(isMatch, isTest, isProd),
  };
}

function _getProjectMessage(
  isMatch: boolean,
  isTest: boolean,
  isProd: boolean,
): string {
  if (isMatch && isTest) return "✅ Using TEST project correctly";
  if (isMatch && isProd) return "⚠️ Using PRODUCTION project";
  return "❌ Configuration mismatch";
}
