//app/client/orders/[id]/page.tsx

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
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "partially-delivered":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">
          Order not found or access denied.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Order Details</h1>
            <p className="text-sm text-gray-500">Track your job progress</p>
          </div>
          <Link
            href="/client/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to My Orders
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold">{order.book.identification}</h2>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              order.status,
            )}`}
          >
            {order.status}
          </span>
          <p className="text-sm text-gray-500 mt-3">
            Created: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Order Information</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Business NIT:</span>{" "}
            {order.businessNIT}
          </p>
          {order.businessName && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Business Name:</span>{" "}
              {order.businessName}
            </p>
          )}
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <p>
              <span className="font-medium">Quantity:</span>{" "}
              {order.specifications.quantity}
            </p>
            <p>
              <span className="font-medium">Spiral Length:</span>{" "}
              {order.specifications.spiralLength}
            </p>
            <p>
              <span className="font-medium">Binding Type:</span>{" "}
              {order.specifications.bindingType}
            </p>
            {order.specifications.spiralColor && (
              <p>
                <span className="font-medium">Spiral Color:</span>{" "}
                {order.specifications.spiralColor}
              </p>
            )}
            {order.specifications.sheetsPerBook && (
              <p>
                <span className="font-medium">Sheets per Book:</span>{" "}
                {order.specifications.sheetsPerBook}
              </p>
            )}
          </div>
          {order.specifications.additionalNotes && (
            <p className="text-sm text-gray-600 mt-3">
              <span className="font-medium">Notes:</span>{" "}
              {order.specifications.additionalNotes}
            </p>
          )}
        </div>

        {/* Quote */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Quote</h3>
          {order.quote?.totalPrice ? (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Total Price:</span> $
              {order.quote.totalPrice.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-gray-400">No quote available yet</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Payment</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Status:</span>{" "}
            {order.paymentStatus || "pending"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Total Paid:</span> $
            {Number(order.totalPaid || 0).toLocaleString()}
          </p>

          {order.payments && order.payments.length > 0 ? (
            <div className="space-y-3 mt-4">
              {order.payments.map((payment, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 text-sm text-gray-600"
                >
                  <p>
                    <span className="font-medium">Amount:</span> $
                    {Number(payment.amount).toLocaleString()}
                  </p>
                  {payment.method && (
                    <p>
                      <span className="font-medium">Method:</span>{" "}
                      {payment.method}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(payment.receivedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-3">
              No payments recorded yet
            </p>
          )}
        </div>

        {/* Deliveries */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Deliveries</h3>
          {order.deliveries && order.deliveries.length > 0 ? (
            <div className="space-y-3">
              {order.deliveries.map((delivery, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 text-sm text-gray-600"
                >
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(delivery.deliveryDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
                    {delivery.quantityDelivered}
                  </p>
                  <p>
                    <span className="font-medium">Signed by:</span>{" "}
                    {delivery.signedBy}
                  </p>
                  {delivery.notes && (
                    <p>
                      <span className="font-medium">Notes:</span>{" "}
                      {delivery.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No deliveries recorded yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
