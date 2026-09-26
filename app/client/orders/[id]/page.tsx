// app/client/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  _id: string;
  businessNIT: string;
  businessName?: string;
  book: {
    identification: string;
    coverImage?: string;
  };
  status: string;
  specifications: {
    quantity: number;
    spiralLength: number;
    sheetsPerBook?: number;
    bindingType: string;
    spiralColor?: string;
    additionalNotes?: string;
  };
  quote?: {
    totalPrice?: number;
    calculatedAt?: string;
  };
  payments?: Array<{
    amount: number;
    method?: string;
    notes?: string;
    receivedDate: string;
  }>;
  paymentStatus?: string;
  totalPaid?: number;
  deliveries?: Array<{
    deliveryDate: string;
    quantityDelivered: number;
    signedBy: string;
    notes?: string;
  }>;
  createdAt: string;
}

const cardClass =
  "bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6";

export default function ClientOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser || storedUser === "undefined") {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      toast.error("Invalid session. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    if (parsedUser.role !== "client") {
      toast.error("Access denied");
      router.push("/login");
      return;
    }

    fetchOrder(token);
  }, [router, orderId]);

  const fetchOrder = async (token: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch order details");
      }

      setOrder(result.data);
    } catch (error: any) {
      toast.error(error.message || "Unable to load order");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "in-progress":
        return "bg-sky-100 text-sky-800";
      case "completed":
        return "bg-indigo-100 text-indigo-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "partially-delivered":
        return "bg-violet-100 text-violet-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-[#E8DFD0] text-[#1F1A16]";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6] text-[#1F1A16]">
        <p className="text-lg">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6]">
        <p className="text-lg text-red-600">
          Order not found or access denied.
        </p>
      </div>
    );
  }

  const labelClass = "font-medium text-[#1F1A16]";

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F1A16]">
      <header className="sticky top-0 z-10 bg-[#FFFCF7]/90 border-b border-[#DDD4C6] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-[#9A3412] text-white grid place-items-center text-sm font-bold">
              B
            </span>
            <div>
              <h1 className="text-xl font-semibold">Order Details</h1>
              <p className="text-sm text-[#6B6258]">Track your job progress</p>
            </div>
          </div>
          <Link
            href="/client/dashboard"
            className="text-sm font-medium text-[#9A3412] hover:underline"
          >
            Back to My Orders
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className={cardClass}>
          <h2 className="text-lg font-semibold">{order.book.identification}</h2>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              order.status,
            )}`}
          >
            {order.status.replace(/-/g, " ")}
          </span>
          <p className="text-sm text-[#6B6258] mt-3">
            Created: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Order Information</h3>
          <p className="text-sm text-[#6B6258]">
            <span className={labelClass}>Business NIT:</span>{" "}
            {order.businessNIT}
          </p>
          {order.businessName && (
            <p className="text-sm text-[#6B6258] mt-1">
              <span className={labelClass}>Business Name:</span>{" "}
              {order.businessName}
            </p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#6B6258]">
            <p>
              <span className={labelClass}>Quantity:</span>{" "}
              {order.specifications.quantity}
            </p>
            <p>
              <span className={labelClass}>Spiral Length:</span>{" "}
              {order.specifications.spiralLength}
            </p>
            <p>
              <span className={labelClass}>Binding Type:</span>{" "}
              {order.specifications.bindingType}
            </p>
            {order.specifications.spiralColor && (
              <p>
                <span className={labelClass}>Spiral Color:</span>{" "}
                {order.specifications.spiralColor}
              </p>
            )}
            {order.specifications.sheetsPerBook && (
              <p>
                <span className={labelClass}>Sheets per Book:</span>{" "}
                {order.specifications.sheetsPerBook}
              </p>
            )}
          </div>
          {order.specifications.additionalNotes && (
            <p className="text-sm text-[#6B6258] mt-3">
              <span className={labelClass}>Notes:</span>{" "}
              {order.specifications.additionalNotes}
            </p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Quote</h3>
          {order.quote?.totalPrice ? (
            <p className="text-sm text-[#6B6258]">
              <span className={labelClass}>Total Price:</span> $
              {order.quote.totalPrice.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-[#6B6258]">No quote available yet</p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Payment</h3>
          <p className="text-sm text-[#6B6258]">
            <span className={labelClass}>Status:</span>{" "}
            {order.paymentStatus || "pending"}
          </p>
          <p className="text-sm text-[#6B6258] mt-1">
            <span className={labelClass}>Total Paid:</span> $
            {Number(order.totalPaid || 0).toLocaleString()}
          </p>

          {order.payments && order.payments.length > 0 ? (
            <div className="space-y-3 mt-4">
              {order.payments.map((payment, index) => (
                <div
                  key={index}
                  className="border border-[#DDD4C6] rounded-xl p-3 text-sm text-[#6B6258]"
                >
                  <p>
                    <span className={labelClass}>Amount:</span> $
                    {Number(payment.amount).toLocaleString()}
                  </p>
                  {payment.method && (
                    <p>
                      <span className={labelClass}>Method:</span>{" "}
                      {payment.method}
                    </p>
                  )}
                  <p>
                    <span className={labelClass}>Date:</span>{" "}
                    {new Date(payment.receivedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B6258] mt-3">
              No payments recorded yet
            </p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Deliveries</h3>
          {order.deliveries && order.deliveries.length > 0 ? (
            <div className="space-y-3">
              {order.deliveries.map((delivery, index) => (
                <div
                  key={index}
                  className="border border-[#DDD4C6] rounded-xl p-3 text-sm text-[#6B6258]"
                >
                  <p>
                    <span className={labelClass}>Date:</span>{" "}
                    {new Date(delivery.deliveryDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className={labelClass}>Quantity:</span>{" "}
                    {delivery.quantityDelivered}
                  </p>
                  <p>
                    <span className={labelClass}>Signed by:</span>{" "}
                    {delivery.signedBy}
                  </p>
                  {delivery.notes && (
                    <p>
                      <span className={labelClass}>Notes:</span>{" "}
                      {delivery.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B6258]">No deliveries recorded yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
