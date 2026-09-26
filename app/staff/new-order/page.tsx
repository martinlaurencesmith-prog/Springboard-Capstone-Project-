// app/staff/new-order/page.tsx
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

const inputClass =
  "w-full px-3 py-2 border border-[#DDD4C6] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30 focus:border-[#9A3412]";

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
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F1A16]">
      <header className="sticky top-0 z-10 bg-[#FFFCF7]/90 border-b border-[#DDD4C6] backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-[#9A3412] text-white grid place-items-center text-sm font-bold">
              B
            </span>
            <div>
              <h1 className="text-xl font-semibold">Create New Order</h1>
              <p className="text-sm text-[#6B6258]">
                Logged in as {user?.name} ({user?.role})
              </p>
            </div>
          </div>

          <Link
            href="/staff/dashboard"
            className="text-sm font-medium text-[#9A3412] hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Business NIT *
            </label>
            <input
              type="text"
              {...register("businessNIT")}
              className={inputClass}
              placeholder="900123456"
            />
            {errors.businessNIT && (
              <p className="text-red-600 text-sm mt-1">
                {errors.businessNIT.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Business Name *
            </label>
            <input
              type="text"
              {...register("businessName")}
              className={inputClass}
              placeholder="My Print Shop"
            />
            {errors.businessName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Book / Job Identification *
            </label>
            <input
              type="text"
              {...register("bookIdentification")}
              className={inputClass}
              placeholder="Harry Potter - Chamber of Secrets"
            />
            {errors.bookIdentification && (
              <p className="text-red-600 text-sm mt-1">
                {errors.bookIdentification.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Image URL (Optional)
            </label>
            <input
              type="text"
              {...register("coverImage")}
              className={inputClass}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity *
              </label>
              <input
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                className={inputClass}
                placeholder="100"
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">
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
                className={inputClass}
                placeholder="28"
              />
              {errors.spiralLength && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.spiralLength.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sheets per Book (Optional)
            </label>
            <input
              type="number"
              {...register("sheetsPerBook", { valueAsNumber: true })}
              className={inputClass}
              placeholder="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Binding Type *
            </label>
            <select {...register("bindingType")} className={inputClass}>
              <option value="">Select binding type</option>
              <option value="metallic">Metallic</option>
              <option value="plastic">Plastic</option>
              <option value="metallic-hook">Metallic Hook</option>
              <option value="hardbound">Hardbound</option>
              <option value="softbound">Softbound</option>
              <option value="other">Other</option>
            </select>
            {errors.bindingType && (
              <p className="text-red-600 text-sm mt-1">
                {errors.bindingType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Spiral Color (Optional)
            </label>
            <select {...register("spiralColor")} className={inputClass}>
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
              Additional Notes (Optional)
            </label>
            <textarea
              {...register("additionalNotes")}
              rows={3}
              className={inputClass}
              placeholder="Any special instructions..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#9A3412] text-white py-2.5 rounded-xl font-semibold hover:bg-[#7C2D12] transition disabled:opacity-50"
          >
            {isLoading ? "Creating Order" : "Create Order"}
          </button>
        </form>
      </main>
    </div>
  );
}
