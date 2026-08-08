// api/protected/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "staff"]);

  // Return error if there is one
  if (auth.error) {
    return auth.error;
  }

  // Return the authenticated user information
  return NextResponse.json({
    message: "Access granted to protected route",
    user: auth.user,
  });
}
