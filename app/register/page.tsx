//app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  businessNIT: z.string().min(5, "Business NIT is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters long"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const inputClass =
  "w-full px-3 py-2 border border-[#DDD4C6] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30 focus:border-[#9A3412]";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to register. Please try again.",
        );
      }

      if (!result.token || !result.user) {
        throw new Error(
          result.error || "Invalid token or user data. Please try again.",
        );
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      toast.success("Registration successful! Redirecting to dashboard...");
      router.push("/client/dashboard");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6] px-4 py-10 text-[#1F1A16]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#9A3412] text-white grid place-items-center text-sm font-bold">
              B
            </span>
            <span className="text-xl font-semibold tracking-tight">
              BindFlow
            </span>
          </Link>
          <div className="mt-3">
            <Link
              href="/"
              className="text-sm font-medium text-[#9A3412] hover:underline"
            >
              Back to home
            </Link>
          </div>
        </div>

        <div className="bg-[#FFFCF7] p-8 rounded-2xl border border-[#DDD4C6] shadow-sm">
          <h1 className="text-2xl font-semibold text-center mb-1">
            Create Account
          </h1>
          <p className="text-sm text-[#6B6258] text-center mb-6">
            Register as a client to track your binding jobs
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register("name")}
                className={inputClass}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                {...register("email")}
                className={inputClass}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                {...register("password")}
                className={inputClass}
                placeholder="********"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Business NIT
              </label>
              <input
                type="text"
                {...register("businessNIT")}
                className={inputClass}
                placeholder="123456789"
              />
              {errors.businessNIT && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.businessNIT.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name
              </label>
              <input
                type="text"
                {...register("businessName")}
                className={inputClass}
                placeholder="My Business Name"
              />
              {errors.businessName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone (Optional)
              </label>
              <input
                type="text"
                {...register("phone")}
                className={inputClass}
                placeholder="123-456-7890"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9A3412] text-white py-2.5 rounded-xl font-semibold hover:bg-[#7C2D12] transition disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-[#6B6258]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#9A3412] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
