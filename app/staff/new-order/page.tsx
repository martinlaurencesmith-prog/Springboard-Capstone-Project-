//app/staff/new-order/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";

const orderSchema = z.object({
  businessNIT: z.string().min(5, "Business NIT is required"),
  businessName: z.string().min(1, "Business Name is required"),
  bookIdentification: z.string().min(1, "Book Identification is required"),
  coverImage: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  spiralLength: z.number().min(1, "Spiral length is required"),
  sheetsPerBook: z.number().optional(),
  bindingType: z.enum([
    "metallic",
    "plastic",
    "metallic-hook",
    "hardbound",
    "softbound",
    "other",
  ]),

  spiralColor: z
    .enum([
      "black",
      "white",
      "silver",
      "clear",
      "gold",
      "rose-gold",
      "red",
      "green",
      "blue",
      "custom",
    ])
    .optional(),

  additionalNotes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;
export default function NewOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      toast.error("You must be logged in to access this page.");
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "staff" && parsedUser.role !== "admin") {
      toast.error("You do not have permission to access this page.");
      router.push("/login");
      return;
    }
    setUser(parsedUser);
  }, [router]);

  const onSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessNIT: data.businessNIT,
          businessName: data.businessName,
          book: {
            identification: data.bookIdentification,
            coverImage: data.coverImage || "",
          },

          specifications: {
            quantity: data.quantity,
            spiralLength: data.spiralLength,
            sheetsPerBook: data.sheetsPerBook || 0,
            bindingType: data.bindingType,
            spiralColor: data.spiralColor || "",
            additionalNotes: data.additionalNotes || "",
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }
      toast.success("Order created successfully!");
      router.push("/staff/dashboard");
    } catch (error: any) {
      toast.error("An error occurred while creating the order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1>Create New Order</h1>
            <p>
              Logged in as {user?.name} ({user?.role})
            </p>
          </div>

          <Link
            href="/staff/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </header>

      {/* Form Section */}

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-sm p-6 space-y-5"
        >
          {/* Business NIT  */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Business NIT*
            </label>
            <input
              type="text"
              {...register("businessNIT")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="900123456"
            />{" "}
            {errors.businessNIT && (
              <p className="text-red-500 text-sm mt-1">
                {errors.businessNIT.message}
              </p>
            )}
          </div>
          {/* Business Name  */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Business Name *
            </label>
            <input
              type="text"
              {...register("businessName")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Print Shop"
            />
            {errors.businessName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Book Identification */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Book / Job Identification *
            </label>
            <input
              type="text"
              {...register("bookIdentification")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Harry Potter - Chamber of Secrets"
            />
            {errors.bookIdentification && (
              <p className="text-red-500 text-sm mt-1">
                {errors.bookIdentification.message}
              </p>
            )}
          </div>

          {/* Cover Image URL (Optional) */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Image URL (Optional)
            </label>
            <input
              type="text"
              {...register("coverImage")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          {/* Quantity + Spiral Length  */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity*
              </label>
              <input
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Spiral Length (in) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("spiralLength", { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="28"
              />
              {errors.spiralLength && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.spiralLength.message}
                </p>
              )}
            </div>
          </div>

          {/* Sheets per Book */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Sheets per Book (Optional)
            </label>
            <input
              type="number"
              {...register("sheetsPerBook", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="120"
            />
          </div>

          {/* Binding Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Binding Type *
            </label>
            <select
              {...register("bindingType")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select binding type</option>
              <option value="metallic">Metallic</option>
              <option value="plastic">Plastic</option>
              <option value="metallic-hook">Metallic Hook</option>
              <option value="hardbound">Hardbound</option>
              <option value="softbound">Softbound</option>
              <option value="other">Other</option>
            </select>
            {errors.bindingType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.bindingType.message}
              </p>
            )}
          </div>

          {/* Spiral Color */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Spiral Color (Optional)
            </label>
            <select
              {...register("spiralColor")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              {...register("additionalNotes")}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any special instructions..."
            />
          </div>
          {/* Submit Button  */}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Creating Order" : "Create Order"}
          </button>
        </form>
      </main>
    </div>
  );
}
