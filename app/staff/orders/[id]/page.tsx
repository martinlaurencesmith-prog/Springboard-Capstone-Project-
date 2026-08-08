//app/staff/orders/[id]/page.tsx

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
    breakdown?: any;
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

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status
  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Quote
  const [quotePrice, setQuotePrice] = useState<number | "">("");
  const [isUpdatingQuote, setIsUpdatingQuote] = useState(false);

  // Delivery
  const [deliveryDate, setDeliveryDate] = useState("");
  const [quantityDelivered, setQuantityDelivered] = useState<number | "">("");
  const [signedBy, setSignedBy] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isRecordingDelivery, setIsRecordingDelivery] = useState(false);

  // Payment
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("partially-received");
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "staff" && parsedUser.role !== "admin") {
      toast.error("Access denied");
      router.push("/client/dashboard");
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
        throw new Error(result.error || "Failed to fetch order");
      }

      setOrder(result.data);
      setStatus(result.data.status);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!status) return;
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to update status");

      setOrder(result.data);
      toast.success("Status updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuoteUpdate = async () => {
    if (quotePrice === "" || Number(quotePrice) < 0) {
      toast.error("Please enter a valid total price");
      return;
    }

    setIsUpdatingQuote(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/quote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ totalPrice: Number(quotePrice) }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to update quote");

      setOrder(result.data);
      setQuotePrice("");
      toast.success("Quote updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingQuote(false);
    }
  };

  const handleRecordDelivery = async () => {
    if (!deliveryDate || quantityDelivered === "" || !signedBy) {
      toast.error("Delivery date, quantity, and signed by are required");
      return;
    }

    setIsRecordingDelivery(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/deliveries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryDate,
          quantityDelivered: Number(quantityDelivered),
          signedBy,
          notes: deliveryNotes || "",
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to record delivery");

      setOrder(result.data);
      setDeliveryDate("");
      setQuantityDelivered("");
      setSignedBy("");
      setDeliveryNotes("");
      toast.success("Delivery recorded successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRecordingDelivery(false);
    }
  };

  const handleDeleteOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete order");
      }

      toast.success("Order deleted successfully");
      router.push("/staff/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete order");
    }
  };
  const handlePaymentUpdate = async () => {
    if (paymentAmount === "" || Number(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsUpdatingPayment(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          method: paymentMethod || "",
          notes: paymentNotes || "",
          status: paymentStatus,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to record payment");

      setOrder(result.data);
      setPaymentAmount("");
      setPaymentMethod("");
      setPaymentNotes("");
      toast.success("Payment recorded successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const getStatusColor = (value: string) => {
    switch (value) {
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
        <p className="text-lg text-red-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Order Details</h1>
            <p className="text-sm text-gray-500">ID: {order._id}</p>
          </div>
          <Link
            href="/staff/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <button
            onClick={handleDeleteOrder}
            className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
          >
            Delete Order
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {order.book.identification}
              </h2>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="partially-delivered">Partially Delivered</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Client Information</h3>
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
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Created:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
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
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Current Total Price:</span> $
              {order.quote.totalPrice.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No quote yet</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium mb-1">
                Total Price
              </label>
              <input
                type="number"
                value={quotePrice}
                onChange={(e) =>
                  setQuotePrice(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="450000"
              />
            </div>
            <button
              onClick={handleQuoteUpdate}
              disabled={isUpdatingQuote}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingQuote ? "Saving..." : "Save Quote"}
            </button>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Payment</h3>

          <div className="text-sm text-gray-600 space-y-1 mb-4">
            <p>
              <span className="font-medium">Status:</span>{" "}
              {order.paymentStatus || "pending"}
            </p>
            <p>
              <span className="font-medium">Total Paid:</span> $
              {Number(order.totalPaid || 0).toLocaleString()}
            </p>
          </div>

          {order.payments && order.payments.length > 0 ? (
            <div className="space-y-3 mb-6">
              {order.payments.map((p, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 text-sm text-gray-600"
                >
                  <p>
                    <span className="font-medium">Amount:</span> $
                    {Number(p.amount).toLocaleString()}
                  </p>
                  {p.method && (
                    <p>
                      <span className="font-medium">Method:</span> {p.method}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(p.receivedDate).toLocaleDateString()}
                  </p>
                  {p.notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {p.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-6">
              No payments recorded yet
            </p>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Add Payment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="200000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Method</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Cash, Transfer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="partially-received">Partially Received</option>
                  <option value="received">Received</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <button
              onClick={handlePaymentUpdate}
              disabled={isUpdatingPayment}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingPayment ? "Saving..." : "Add Payment"}
            </button>
          </div>
        </div>

        {/* Deliveries */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">Deliveries</h3>

          {order.deliveries && order.deliveries.length > 0 ? (
            <div className="space-y-3 mb-6">
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
            <p className="text-sm text-gray-400 mb-6">
              No deliveries recorded yet
            </p>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Record New Delivery</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity Delivered *
                </label>
                <input
                  type="number"
                  value={quantityDelivered}
                  onChange={(e) =>
                    setQuantityDelivered(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Signed By *
                </label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Carlos Ramirez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <button
              onClick={handleRecordDelivery}
              disabled={isRecordingDelivery}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isRecordingDelivery ? "Saving..." : "Record Delivery"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
