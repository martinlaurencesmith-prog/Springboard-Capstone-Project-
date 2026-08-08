// app/api/orders/[id]/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { withAuth } from "@/lib/withAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAuth(request, ["staff", "admin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    const amount = Number(body.amount);
    const method = body.method || "";
    const notes = body.notes || "";
    const status = body.status as
      | "pending"
      | "partially-received"
      | "received"
      | "verified"
      | undefined;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "A valid payment amount is required" },
        { status: 400 },
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.payments = order.payments || [];
    order.payments.push({
      amount,
      method,
      notes,
      receivedDate: new Date(),
      recordedBy: auth.user.userId as any,
    });

    order.totalPaid = order.payments.reduce(
      (sum: number, p: any) => sum + (Number(p.amount) || 0),
      0,
    );

    if (status) {
      order.paymentStatus = status;
    } else if (order.totalPaid <= 0) {
      order.paymentStatus = "pending";
    } else {
      order.paymentStatus = "partially-received";
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment", details: error.message },
      { status: 500 },
    );
  }
}
