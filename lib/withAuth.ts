// lib/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export interface AuthenticatedUser {
  userId: string;
  role: "client" | "staff" | "admin";
}

// Success type
type AuthSuccess = {
  user: AuthenticatedUser;
  error?: undefined;
};

// Error type
type AuthError = {
  error: NextResponse;
  user?: undefined;
};

export async function withAuth(
  request: NextRequest,
  allowedRoles?: Array<"client" | "staff" | "admin">,
): Promise<AuthSuccess | AuthError> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        error: NextResponse.json(
          { error: "Authorization token missing" },
          { status: 401 },
        ),
      };
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        error: NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 },
        ),
      };
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(decoded.role as any)) {
        return {
          error: NextResponse.json(
            { error: "Access denied. Insufficient permissions." },
            { status: 403 },
          ),
        };
      }
    }

    return {
      user: decoded as AuthenticatedUser,
    };
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 },
      ),
    };
  }
}
