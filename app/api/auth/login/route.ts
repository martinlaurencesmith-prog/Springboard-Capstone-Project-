//app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { comparePassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    // Basic validation

    if (!email || !password) {
      return NextResponse.json({
        error: "Email and password are required",
        status: 400,
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        error: "User was not found",
        status: 404,
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        error: "Invalid Password",
        status: 401,
      });
    }
    //Generate JWT token for the authenticated user

    const token = generateToken(user._id.toString(), user.role);
    //Return the token and the user without the password field
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        businessName: user.businessName,
        businessNIT: user.businessNIT,
      },
    });
  } catch (error: any) {
    console.error("An error has occurred during login>", error);
    return NextResponse.json({
      error: "An error has occurred during login",
      status: 500,
    });
  }
}
