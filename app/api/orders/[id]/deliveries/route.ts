//app/api/orders/[id]/deliveries/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { withAuth } from "@/lib/withAuth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAuth(request, ["staff", "admin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    const { deliveryDate, quantityDelivered, signedBy, notes, signatureImage } =
      body;

    if (!deliveryDate || !quantityDelivered || !signedBy) {
      return NextResponse.json(
        { error: "deliveryDate, quantityDelivered, and signedBy are required" },
        { status: 400 },
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.deliveries = order.deliveries || [];
    order.deliveries.push({
      deliveryDate: new Date(deliveryDate),
      quantityDelivered: Number(quantityDelivered),
      signedBy,
      notes: notes || "",
      signatureImage: signatureImage || "",
    });

    const totalDelivered = order.deliveries.reduce(
      (sum: number, d: any) => sum + (Number(d.quantityDelivered) || 0),
      0,
    );

    if (totalDelivered >= order.specifications.quantity) {
      order.status = "delivered";
    } else if (totalDelivered > 0) {
      order.status = "partially-delivered";
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Delivery recorded successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Error recording delivery:", error);
    return NextResponse.json(
      { error: "Failed to record delivery", details: error.message },
      { status: 500 },
    );
  }
}
