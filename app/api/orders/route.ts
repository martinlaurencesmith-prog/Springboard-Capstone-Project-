// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "staff"]);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || null;
    const businessNIT = searchParams.get("businessNIT") || null;
    const fromDate = searchParams.get("fromDate") || null;
    const toDate = searchParams.get("toDate") || null;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (businessNIT) {
      filter.businessNIT = businessNIT;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
      },
      filtersApplied: {
        status: status || null,
        businessNIT: businessNIT || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
      },
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

// POST function to create a new order
export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["staff", "admin"]);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    await dbConnect();

    const body = await request.json();
    const { businessNIT, businessName, book, specifications } = body;

    if (
      !businessNIT ||
      !book?.identification ||
      !specifications?.quantity ||
      !specifications?.spiralLength ||
      !specifications?.bindingType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Try to find registered client by NIT
    const clientUser = await User.findOne({
      businessNIT,
      role: "client",
    });

    const newOrder = await Order.create({
      ...(clientUser ? { client: clientUser._id } : {}), // assign only if registered
      businessNIT,
      businessName: businessName || clientUser?.businessName || "",
      book: {
        identification: book.identification,
        coverImage: book.coverImage || "",
      },
      specifications: {
        quantity: specifications.quantity,
        spiralLength: specifications.spiralLength,
        sheetsPerBook: specifications.sheetsPerBook || null,
        bindingType: specifications.bindingType,
        spiralColor: specifications.spiralColor || null,
        additionalNotes: specifications.additionalNotes || "",
      },
      status: "pending",
      payments: [],
      paymentStatus: "pending",
      totalPaid: 0,
      deliveries: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: clientUser
          ? "Order created and assigned to registered client"
          : "Order created without registered client account",
        data: newOrder,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
