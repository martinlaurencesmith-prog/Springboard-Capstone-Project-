// app/staff/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  _id: string;
  businessNIT: string;
  book: {
    identification: string;
    coverImage?: string;
  };
  status: string;
  specifications: {
    quantity: number;
    bindingType: string;
  };
  createdAt: string;
  quote?: {
    totalPrice?: number;
  };
  client?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface DashboardStats {
  totalOrders: number;
  pending: number;
  inProgress: number;
  completed: number;
  delivered: number;
  cancelled: number;
  partiallyDelivered: number;
}

export default function StaffDashBoard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    delivered: 0,
    cancelled: 0,
    partiallyDelivered: 0,
  });

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

    if (parsedUser.role !== "staff" && parsedUser.role !== "admin") {
      toast.error("Access denied");
      router.push("/client/dashboard");
      return;
    }

    setUser(parsedUser);
    fetchStats(token);
    fetchOrders(token, statusFilter, page, searchQuery);
  }, [router, statusFilter, page, searchQuery]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/orders/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch stats");
      }

      setStats(result.data);
    } catch (error: any) {
      console.error(error.message || "Failed to fetch stats");
    }
  };

  const fetchOrders = async (
    token: string,
    status: string,
    currentPage: number,
    search: string,
  ) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
      });

      if (status) params.set("status", status);
      if (search) params.set("search", search);

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch orders");
      }

      setOrders(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
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

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6] text-[#1F1A16]">
        <p className="text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }

  const statTiles = [
    { label: "Total", value: stats.totalOrders, color: "text-[#1F1A16]" },
    { label: "Pending", value: stats.pending, color: "text-amber-700" },
    { label: "In Progress", value: stats.inProgress, color: "text-sky-800" },
    { label: "Completed", value: stats.completed, color: "text-indigo-800" },
    {
      label: "Partial",
      value: stats.partiallyDelivered,
      color: "text-violet-800",
    },
    { label: "Delivered", value: stats.delivered, color: "text-emerald-800" },
    { label: "Cancelled", value: stats.cancelled, color: "text-red-800" },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F1A16]">
      <header className="sticky top-0 z-10 bg-[#FFFCF7]/90 border-b border-[#DDD4C6] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-[#9A3412] text-white grid place-items-center text-sm font-bold">
              B
            </span>
            <div>
              <h1 className="text-xl font-semibold">Staff Dashboard</h1>
              <p className="text-sm text-[#6B6258]">
                Welcome, {user?.name} ({user?.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-sm font-medium text-[#9A3412] hover:underline"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold bg-[#B91C1C] text-white rounded-xl hover:bg-[#991B1B] transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
          {statTiles.map((tile) => (
            <div
              key={tile.label}
              className="bg-[#FFFCF7] border border-[#DDD4C6] rounded-2xl px-4 py-3 shadow-sm"
            >
              <p className="text-xs text-[#6B6258]">{tile.label}</p>
              <p className={`text-2xl font-semibold mt-1 ${tile.color}`}>
                {tile.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold">Orders</h2>

            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value);
                }}
                className="px-3 py-2 border border-[#DDD4C6] rounded-xl text-sm bg-[#FFFCF7]"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="partially-delivered">Partially Delivered</option>
                <option value="delivered">Delivered</option>
              </select>

              <Link
                href="/staff/new-order"
                className="px-4 py-2 bg-[#9A3412] text-white rounded-xl hover:bg-[#7C2D12] transition text-sm font-semibold whitespace-nowrap"
              >
                + New Order
              </Link>
            </div>
          </div>

          <form onSubmit={applySearch} className="flex gap-3 max-w-xs">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by book name or NIT"
              className="w-full px-3 py-2 border border-[#DDD4C6] rounded-xl bg-[#FFFCF7] text-sm focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30 focus:border-[#9A3412]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1F1A16] text-white rounded-xl text-sm font-semibold hover:bg-black transition whitespace-nowrap"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="px-4 py-2 border border-[#DDD4C6] rounded-xl text-sm bg-[#FFFCF7]"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-8 text-center">
            <p className="text-[#6B6258]">No orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="text-lg font-semibold leading-snug">
                      {order.book.identification}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status.replace(/-/g, " ")}
                    </span>
                  </div>

                  <p className="text-sm text-[#6B6258]">
                    NIT: {order.businessNIT}
                  </p>
                  <p className="text-sm text-[#6B6258] mt-1">
                    Qty: {order.specifications.quantity} | Binding:{" "}
                    {order.specifications.bindingType}
                  </p>
                  <p className="text-sm text-[#6B6258] mt-1">
                    Created: {new Date(order.createdAt).toLocaleDateString()}
                  </p>

                  {order.quote?.totalPrice && (
                    <p className="mt-3 text-sm font-medium">
                      Quote: ${order.quote.totalPrice.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#DDD4C6]">
                  <Link
                    href={`/staff/orders/${order._id}`}
                    className="text-sm font-medium text-[#9A3412] hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-[#DDD4C6] rounded-xl text-sm disabled:opacity-50 bg-[#FFFCF7]"
            >
              Previous
            </button>

            <span className="text-sm text-[#6B6258]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-[#DDD4C6] rounded-xl text-sm disabled:opacity-50 bg-[#FFFCF7]"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
