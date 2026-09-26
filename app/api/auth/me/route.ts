//app/api/auth/me/routes.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { withAuth } from "@/lib/withAuth";

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["client", "staff", "admin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    const user = await User.findById(auth.user.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await withAuth(request, ["client", "staff", "admin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();

    const allowedFields = [
      "name",
      "phone",
      "address",
      "businessName",
      //NIT is not allowed to be changed since is information related to the business and is used for tax purposes
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const user = await User.findByIdAndUpdate(auth.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await withAuth(request, ["client", "staff", "admin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    const deleted = await User.findByIdAndDelete(auth.user.userId);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
