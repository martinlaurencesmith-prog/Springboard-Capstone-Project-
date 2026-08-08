//app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      businessName,
      businessNIT,
    } = body;

    // Basic validation

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    // Hash the password

    const hashedPassword = await hashPassword(password);

    //Create new user

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      businessName,
      businessNIT,
      role: "client", //defaul role is client, only admin can change it to staff or admin
    });

    //Generate JWT token for the new user

    const token = generateToken(newUser._id.toString(), newUser.role);

    // Return the new user (without the password) and the token

    return NextResponse.json({
      message: "User has been registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        businessName: newUser.businessName,
        businessNIT: newUser.businessNIT,
      },
    });
  } catch (error: any) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      {
        error: "An error occurred while registering the user.",
      },
      { status: 500 },
    );
  }
}
