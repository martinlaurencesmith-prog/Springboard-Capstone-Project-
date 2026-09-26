// app/client/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  _id: string;
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
}

export default function ClientDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch orders");
        }

        setOrders(result.data || []);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6] text-[#1F1A16]">
        <p className="text-lg">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F1A16]">
      <header className="sticky top-0 z-10 bg-[#FFFCF7]/90 border-b border-[#DDD4C6] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-[#9A3412] text-white grid place-items-center text-sm font-bold">
              B
            </span>
            <div>
              <h1 className="text-xl font-semibold">BindFlow</h1>
              <p className="text-sm text-[#6B6258]">
                Welcome, {user?.name || "Client"}
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
        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

        {orders.length === 0 ? (
          <div className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-12 text-center">
            <p className="text-lg font-medium">No jobs yet</p>
            <p className="text-sm text-[#6B6258] mt-1">
              When the shop creates an order under your NIT, it will show up
              here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {order.book.identification}
                    </h3>
                    <p className="text-sm text-[#6B6258] mt-1">
                      Quantity: {order.specifications.quantity} | Binding:{" "}
                      {order.specifications.bindingType}
                    </p>
                    <p className="text-sm text-[#6B6258] mt-1">
                      Created: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status.replace(/-/g, " ")}
                    </span>
                    <Link
                      href={`/client/orders/${order._id}`}
                      className="text-sm font-medium text-[#9A3412] hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {order.quote?.totalPrice && (
                  <p className="mt-3 text-sm font-medium">
                    Quote: ${order.quote.totalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
