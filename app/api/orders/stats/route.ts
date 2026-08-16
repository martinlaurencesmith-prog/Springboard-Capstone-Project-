//app/api/orders/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { withAuth } from "@/lib/withAuth";

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "staff"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    const [
      totalOrders,
      pending,
      inProgress,
      completed,
      delivered,
      cancelled,
      partiallyDelivered,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "in-progress" }),
      Order.countDocuments({ status: "completed" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.countDocuments({ status: "partially-delivered" }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        pending,
        inProgress,
        completed,
        delivered,
        cancelled,
        partiallyDelivered,
      },
    });
  } catch (error: any) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
