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
        <p className="text-lg">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">BindFlow</h1>
            <p className="text-sm text-gray-500">
              Welcome, {user?.name || "Client"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-sm text-blue-600 hover:underline"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">My Orders</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">You don’t have any orders yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {order.book.identification}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {order.specifications.quantity} | Binding:{" "}
                      {order.specifications.bindingType}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Created: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>

                    <Link
                      href={`/client/orders/${order._id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {order.quote?.totalPrice && (
                  <p className="mt-3 text-sm font-medium text-gray-700">
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
