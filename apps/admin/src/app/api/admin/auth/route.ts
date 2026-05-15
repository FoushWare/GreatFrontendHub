import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getRepositoryFactory } from "@elzatona/database";
import bcrypt from "bcryptjs";
import { authRateLimiter, maskEmail } from "@elzatona/utilities/server";

// Admin config - using environment variables directly
const adminConfig = {
  security: {
    saltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
    sessionTimeout: 24 * 60 * 60 * 1000,
  },
  get jwtSecret() {
    return process.env.JWT_SECRET || "default-secret";
  },
};

async function checkAuthRateLimit(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const {
    success: withinLimit,
    remaining,
    reset,
  } = await authRateLimiter.check(10, ip);

  if (withinLimit) {
    return null;
  }

  return NextResponse.json(
    {
      success: false,
      error: "Too many login attempts. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        "X-RateLimit-Remaining": String(remaining),
      },
    },
  );
}

async function resolveAdminByEmail(email: string) {
  if (process.env.APP_ENV === "test" && email === "test-admin@example.com") {
    console.log(
      `[Admin Auth API] 🛠️ E2E Auth Bypass Triggered for: ${maskEmail(email)}`,
    );
    return {
      id: "e2e-test-admin-id",
      email: "test-admin@example.com",
      role: "admin",
      name: "E2E Test Admin",
      isActive: true,
    };
  }

  const factory = getRepositoryFactory();
  const userRepo = factory.getUserRepository();
  return userRepo.findAdminByEmail(email);
}

function isValidE2ETestPassword(password: string): boolean {
  const configuredPassword = process.env.E2E_TEST_ADMIN_PASSWORD;
  if (!configuredPassword) {
    console.warn(
      "[Admin Auth API] E2E test password is not configured (E2E_TEST_ADMIN_PASSWORD).",
    );
    return false;
  }

  return password === configuredPassword;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkAuthRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const jwtSecret = adminConfig.jwtSecret;
    if (!process.env.JWT_SECRET || jwtSecret === "default-secret") {
      // Log warning but allow if in development
      console.warn("[Admin Auth API] ⚠️ Using default or missing JWT_SECRET");
    }

    // Use repository pattern to find admin by email
    const adminData = await resolveAdminByEmail(email);

    if (!adminData) {
      const maskedEmail = email.replace(/^(.{2})[^@]*(@.*)$/, "$1***$2");
      console.log(`[Admin Auth API] ❌ No admin found for ${maskedEmail}`);
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check if admin is active
    if (adminData.isActive === false) {
      return NextResponse.json(
        { success: false, error: "Admin account is deactivated" },
        { status: 401 },
      );
    }

    // Verify password
    let isValidPassword = false;
    if (adminData.id === "e2e-test-admin-id") {
      isValidPassword = isValidE2ETestPassword(password);
      console.log(
        `[Admin Auth API] 🔑 E2E Password bypass check: ${isValidPassword ? "SUCCESS" : "FAILED"}`,
      );
    } else {
      isValidPassword = await bcrypt.compare(
        password,
        adminData.passwordHash || adminData.password_hash || "",
      );
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create JWT token
    const expiresAt = new Date();
    expiresAt.setTime(
      expiresAt.getTime() + adminConfig.security.sessionTimeout,
    );

    const token = jwt.sign(
      {
        adminId: adminData.id,
        email: adminData.email,
        role: adminData.role,
      },
      jwtSecret,
      { expiresIn: "24h" },
    );

    const session = {
      id: adminData.id,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
      token: token, // Note: The frontend expects this token if it uses it for subsequent requests
      expiresAt: expiresAt.toISOString(),
    };

    return NextResponse.json({ success: true, admin: session });
  } catch (error: unknown) {
    const errorDetails = error as {
      message?: string;
      stack?: string;
      code?: string;
      details?: string;
    };
    console.error("[Admin Auth API] 💥 Auth error:", {
      message: errorDetails.message,
      code: errorDetails.code,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        debug:
          process.env.NODE_ENV === "production"
            ? undefined
            : errorDetails.stack,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const jwtSecret = adminConfig.jwtSecret;
    const decoded = jwt.verify(token, jwtSecret) as {
      adminId: string;
      email: string;
      role: string;
    };

    return NextResponse.json({
      success: true,
      admin: {
        id: decoded.adminId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (_error) {
    console.error("[Admin Auth API] Token verification failed:", _error);
    return NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
