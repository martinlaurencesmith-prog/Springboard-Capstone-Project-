//app/api/orders/[id]/route.ts

// app/api/orders/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { withAuth } from "@/lib/withAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAuth(request, ["admin", "staff", "client"]);
  if ("error" in auth) {
    return auth.error;
  }

  try {
    await dbConnect();

    const { id } = await params;

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Client can only access their own orders
    if (auth.user.role === "client") {
      const orderClientId = order.client ? order.client.toString() : null;

      if (!orderClientId || orderClientId !== auth.user.userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the order" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 },
    );
  }
}

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

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure createdAt exists
    if (!order.createdAt) {
      return NextResponse.json(
        { error: "Order creation date is missing" },
        { status: 400 },
      );
    }

    // Allow editing only within 24 hours of creation
    const createdAt = new Date(order.createdAt).getTime();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (now - createdAt > twentyFourHours) {
      return NextResponse.json(
        {
          error:
            "Order details can only be edited within 24 hours of creation.",
        },
        { status: 403 },
      );
    }

    const updates: any = {};

    if (body.businessNIT !== undefined) {
      updates.businessNIT = body.businessNIT;
    }

    if (body.businessName !== undefined) {
      updates.businessName = body.businessName;
    }

    if (body.book) {
      updates.book = {
        identification: body.book.identification,
        coverImage: body.book.coverImage || "",
      };
    }

    if (body.specifications) {
      updates.specifications = {
        quantity: body.specifications.quantity,
        spiralLength: body.specifications.spiralLength,
        sheetsPerBook: body.specifications.sheetsPerBook || null,
        bindingType: body.specifications.bindingType,
        spiralColor: body.specifications.spiralColor || null,
        additionalNotes: body.specifications.additionalNotes || "",
      };
    }

    if (body.productionNotes !== undefined) {
      updates.productionNotes = body.productionNotes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order details updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating order details:", error);
    return NextResponse.json(
      { error: "Failed to update order details", details: error.message },
      { status: 500 },
    );
  }
}
