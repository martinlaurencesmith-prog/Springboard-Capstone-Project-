// app/staff/orders/[id]/page.tsx
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

const inputClass =
  "w-full px-3 py-2 border border-[#DDD4C6] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30 focus:border-[#9A3412]";

const cardClass =
  "bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6";

const primaryBtn =
  "px-4 py-2 bg-[#9A3412] text-white rounded-xl text-sm font-semibold hover:bg-[#7C2D12] disabled:opacity-50";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [quotePrice, setQuotePrice] = useState<number | "">("");
  const [isUpdatingQuote, setIsUpdatingQuote] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [quantityDelivered, setQuantityDelivered] = useState<number | "">("");
  const [signedBy, setSignedBy] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isRecordingDelivery, setIsRecordingDelivery] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("partially-received");
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [businessNIT, setBusinessNIT] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bookIdentification, setBookIdentification] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [spiralLength, setSpiralLength] = useState<number | "">("");
  const [sheetsPerBook, setSheetsPerBook] = useState<number | "">("");
  const [bindingType, setBindingType] = useState("metallic");
  const [spiralColor, setSpiralColor] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

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

      const data = result.data;
      setOrder(data);
      setStatus(data.status);

      setBusinessNIT(data.businessNIT || "");
      setBusinessName(data.businessName || "");
      setBookIdentification(data.book?.identification || "");
      setQuantity(data.specifications?.quantity ?? "");
      setSpiralLength(data.specifications?.spiralLength ?? "");
      setSheetsPerBook(data.specifications?.sheetsPerBook ?? "");
      setBindingType(data.specifications?.bindingType || "metallic");
      setSpiralColor(data.specifications?.spiralColor || "");
      setAdditionalNotes(data.specifications?.additionalNotes || "");
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

  const handleUpdateDetails = async () => {
    if (
      !bookIdentification ||
      !businessNIT ||
      quantity === "" ||
      spiralLength === "" ||
      !bindingType
    ) {
      toast.error("Please fill in the required order details");
      return;
    }

    setIsSavingDetails(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessNIT,
          businessName,
          book: {
            identification: bookIdentification,
            coverImage: order?.book?.coverImage || "",
          },
          specifications: {
            quantity: Number(quantity),
            spiralLength: Number(spiralLength),
            sheetsPerBook: sheetsPerBook === "" ? null : Number(sheetsPerBook),
            bindingType,
            spiralColor: spiralColor || null,
            additionalNotes: additionalNotes || "",
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update order details");
      }

      setOrder(result.data);
      setIsEditingDetails(false);
      toast.success("Order details updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order details");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const getStatusColor = (value: string) => {
    switch (value) {
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
        <p className="text-lg text-red-600">Order not found</p>
      </div>
    );
  }

  const canEditDetails =
    Date.now() - new Date(order.createdAt).getTime() < 24 * 60 * 60 * 1000;

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
              <p className="text-sm text-[#6B6258]">ID: {order._id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/staff/dashboard"
              className="text-sm font-medium text-[#9A3412] hover:underline"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={handleDeleteOrder}
              className="px-3 py-2 bg-[#B91C1C] text-white text-sm font-semibold rounded-xl hover:bg-[#991B1B]"
            >
              Delete Order
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className={cardClass}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {order.book.identification}
              </h2>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status.replace(/-/g, " ")}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
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
                className="px-3 py-2.5 bg-[#9A3412] text-white rounded-lg text-xs font-semibold hover:bg-[#7C2D12] disabled:opacity-50 whitespace-nowrap"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Order Details</h3>

            {canEditDetails ? (
              <button
                onClick={() => setIsEditingDetails((prev) => !prev)}
                className="text-sm font-medium text-[#9A3412] hover:underline"
              >
                {isEditingDetails ? "Cancel" : "Edit Details"}
              </button>
            ) : (
              <p className="text-xs text-[#6B6258]">
                Editing locked after 24 hours
              </p>
            )}
          </div>

          {!isEditingDetails ? (
            <div className="text-sm text-[#6B6258] space-y-1">
              <p>
                <span className={labelClass}>Title:</span>{" "}
                {order.book.identification}
              </p>
              <p>
                <span className={labelClass}>Business NIT:</span>{" "}
                {order.businessNIT}
              </p>
              {order.businessName && (
                <p>
                  <span className={labelClass}>Business Name:</span>{" "}
                  {order.businessName}
                </p>
              )}
              <p>
                <span className={labelClass}>Quantity:</span>{" "}
                {order.specifications.quantity}
              </p>
              <p>
                <span className={labelClass}>Spiral Length:</span>{" "}
                {order.specifications.spiralLength}
              </p>
              <p>
                <span className={labelClass}>Binding:</span>{" "}
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
              {order.specifications.additionalNotes && (
                <p>
                  <span className={labelClass}>Notes:</span>{" "}
                  {order.specifications.additionalNotes}
                </p>
              )}
              <p>
                <span className={labelClass}>Created:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Book / Job Title *
                </label>
                <input
                  type="text"
                  value={bookIdentification}
                  onChange={(e) => setBookIdentification(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Business NIT *
                </label>
                <input
                  type="text"
                  value={businessNIT}
                  onChange={(e) => setBusinessNIT(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Spiral Length *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={spiralLength}
                    onChange={(e) =>
                      setSpiralLength(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sheets per Book
                  </label>
                  <input
                    type="number"
                    value={sheetsPerBook}
                    onChange={(e) =>
                      setSheetsPerBook(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Binding Type *
                  </label>
                  <select
                    value={bindingType}
                    onChange={(e) => setBindingType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="metallic">Metallic</option>
                    <option value="plastic">Plastic</option>
                    <option value="metallic-hook">Metallic Hook</option>
                    <option value="hardbound">Hardbound</option>
                    <option value="softbound">Softbound</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Spiral Color
                </label>
                <select
                  value={spiralColor}
                  onChange={(e) => setSpiralColor(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select color</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="silver">Silver</option>
                  <option value="clear">Clear</option>
                  <option value="gold">Gold</option>
                  <option value="rose-gold">Rose Gold</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <button
                onClick={handleUpdateDetails}
                disabled={isSavingDetails}
                className={primaryBtn}
              >
                {isSavingDetails ? "Saving..." : "Save Order Details"}
              </button>
            </div>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Quote</h3>
          {order.quote?.totalPrice ? (
            <p className="text-sm text-[#6B6258] mb-4">
              <span className={labelClass}>Current Total Price:</span> $
              {order.quote.totalPrice.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-[#6B6258] mb-4">No quote yet</p>
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
                className={inputClass}
                placeholder="450000"
              />
            </div>
            <button
              onClick={handleQuoteUpdate}
              disabled={isUpdatingQuote}
              className={primaryBtn}
            >
              {isUpdatingQuote ? "Saving..." : "Save Quote"}
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Payment</h3>

          <div className="text-sm text-[#6B6258] space-y-1 mb-4">
            <p>
              <span className={labelClass}>Status:</span>{" "}
              {order.paymentStatus || "pending"}
            </p>
            <p>
              <span className={labelClass}>Total Paid:</span> $
              {Number(order.totalPaid || 0).toLocaleString()}
            </p>
          </div>

          {order.payments && order.payments.length > 0 ? (
            <div className="space-y-3 mb-6">
              {order.payments.map((p, index) => (
                <div
                  key={index}
                  className="border border-[#DDD4C6] rounded-xl p-3 text-sm text-[#6B6258]"
                >
                  <p>
                    <span className={labelClass}>Amount:</span> $
                    {Number(p.amount).toLocaleString()}
                  </p>
                  {p.method && (
                    <p>
                      <span className={labelClass}>Method:</span> {p.method}
                    </p>
                  )}
                  <p>
                    <span className={labelClass}>Date:</span>{" "}
                    {new Date(p.receivedDate).toLocaleDateString()}
                  </p>
                  {p.notes && (
                    <p>
                      <span className={labelClass}>Notes:</span> {p.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B6258] mb-6">
              No payments recorded yet
            </p>
          )}

          <div className="border-t border-[#DDD4C6] pt-4">
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
                  className={inputClass}
                  placeholder="200000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Method</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={inputClass}
                  placeholder="Cash, Transfer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className={inputClass}
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
                  className={inputClass}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <button
              onClick={handlePaymentUpdate}
              disabled={isUpdatingPayment}
              className={"mt-4 " + primaryBtn}
            >
              {isUpdatingPayment ? "Saving..." : "Add Payment"}
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold mb-3">Deliveries</h3>

          {order.deliveries && order.deliveries.length > 0 ? (
            <div className="space-y-3 mb-6">
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
            <p className="text-sm text-[#6B6258] mb-6">
              No deliveries recorded yet
            </p>
          )}

          <div className="border-t border-[#DDD4C6] pt-4">
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
                  placeholder="Carlos Ramirez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className={inputClass}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <button
              onClick={handleRecordDelivery}
              disabled={isRecordingDelivery}
              className={"mt-4 " + primaryBtn}
            >
              {isRecordingDelivery ? "Saving..." : "Record Delivery"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
