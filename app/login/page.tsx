//app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("LOGIN RESULT:", result);

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Invalid email or password",
        );
      }

      if (!result.token || !result.user) {
        throw new Error(
          result.error || result.message || "Invalid email or password",
        );
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login successful!");

      if (result.user.role === "admin" || result.user.role === "staff") {
        router.push("/staff/dashboard");
      } else {
        router.push("/client/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6] px-4 text-[#1F1A16]">
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
          <h1 className="text-2xl font-semibold text-center mb-1">Log In</h1>
          <p className="text-sm text-[#6B6258] text-center mb-6">
            Sign in to manage or track binding jobs
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-[#DDD4C6] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30 focus:border-[#9A3412]"
                placeholder="you@example.com"
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
                className="w-full px-3 py-2 border border-[#DDD4C6] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30 focus:border-[#9A3412]"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9A3412] text-white py-2.5 rounded-xl font-semibold hover:bg-[#7C2D12] transition disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-[#6B6258]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#9A3412] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
