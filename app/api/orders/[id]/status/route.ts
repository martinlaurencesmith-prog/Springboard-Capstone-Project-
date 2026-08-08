//app/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { withAuth } from "@/lib/withAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAuth(request, ["staff", "admin"]);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    //Validate the status
    const allowedStatuses = [
      "pending",
      "in-progress",
      "completed",
      "cancelled",
      "partially-delivered",
      "delivered",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 },
      );
    }
    //Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status", details: error.message },
      { status: 500 },
    );
  }
}
