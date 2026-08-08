// app/api/orders/[id]/quote/route.ts
// app/api/orders/[id]/quote/route.ts
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
    const { totalPrice, breakdown } = body;

    if (totalPrice === undefined || totalPrice === null) {
      return NextResponse.json(
        { error: "totalPrice is required" },
        { status: 400 },
      );
    }

    if (typeof totalPrice !== "number" || totalPrice < 0) {
      return NextResponse.json(
        { error: "totalPrice must be a number greater than or equal to 0" },
        { status: 400 },
      );
    }

    const quoteData = {
      totalPrice,
      calculatedAt: new Date(),
      breakdown: breakdown || {},
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { quote: quoteData },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Quote updated successfully",
      data: updatedOrder, // full order, needed by frontend
    });
  } catch (error: any) {
    console.error("Error updating quote:", error);

    return NextResponse.json(
      { error: "Failed to update quote", details: error.message },
      { status: 500 },
    );
  }
}
