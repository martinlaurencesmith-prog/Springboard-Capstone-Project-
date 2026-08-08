// app/api/orders/my/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { withAuth } from "@/lib/withAuth";

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ["admin", "staff", "client"]);

  if ("error" in authResult) {
    return authResult.error;
  }
  const { user } = authResult;
  try {
    await dbConnect();

    //Get orders that belong to the loggen in user

    const orders = await Order.find({ client: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    console.error("Error occurred while fetching orders:", error);

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
