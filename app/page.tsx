//app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFE6] text-[#1F1A16]">
      <header className="sticky top-0 z-10 bg-[#FFFCF7]/90 border-b border-[#DDD4C6] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#9A3412] text-white grid place-items-center text-sm font-bold">
              B
            </span>
            <h1 className="text-xl font-semibold tracking-tight">BindFlow</h1>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#1F1A16] hover:text-[#9A3412] transition"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-[#9A3412] text-white rounded-xl hover:bg-[#7C2D12] transition"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-20 text-center flex-1">
        <p className="text-xs tracking-[0.22em] uppercase text-[#9A3412] mb-4">
          Production · Quotes · Deliveries
        </p>

        <h2 className="text-4xl sm:text-5xl font-semibold mb-6 leading-tight">
          Bookbinding Order Management
        </h2>

        <p className="text-lg text-[#6B6258] max-w-2xl mx-auto mb-10">
          BindFlow helps staff manage production orders, quotes, deliveries, and
          payments — while clients track the progress of their jobs in real
          time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-[#9A3412] text-white rounded-xl font-semibold hover:bg-[#7C2D12] transition"
          >
            Go to Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-[#FFFCF7] text-[#9A3412] border border-[#DDD4C6] rounded-xl font-semibold hover:bg-[#F4EFE6] transition"
          >
            Create Account
          </Link>
        </div>
      </main>

      <section className="max-w-6xl mx-auto px-4 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6 text-left">
            <p className="text-xs uppercase tracking-widest text-[#9A3412] mb-2">
              Workshop
            </p>
            <h3 className="font-semibold text-lg mb-2">For Staff</h3>
            <p className="text-sm text-[#6B6258] leading-relaxed">
              Create orders, update production status, manage quotes, and record
              partial deliveries from one place.
            </p>
          </div>

          <div className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6 text-left">
            <p className="text-xs uppercase tracking-widest text-[#9A3412] mb-2">
              Visibility
            </p>
            <h3 className="font-semibold text-lg mb-2">For Clients</h3>
            <p className="text-sm text-[#6B6258] leading-relaxed">
              Track the progress of your binding jobs easily and stay informed
              without calling the shop every time.
            </p>
          </div>

          <div className="bg-[#FFFCF7] rounded-2xl border border-[#DDD4C6] shadow-sm p-6 text-left">
            <p className="text-xs uppercase tracking-widest text-[#9A3412] mb-2">
              Oversight
            </p>
            <h3 className="font-semibold text-lg mb-2">For Admins</h3>
            <p className="text-sm text-[#6B6258] leading-relaxed">
              Oversee operations, review payments, and keep the production
              workflow organized and transparent.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#DDD4C6] bg-[#FFFCF7]">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-[#6B6258]">
          © {new Date().getFullYear()} BindFlow — Capstone Project
        </div>
      </footer>
    </div>
  );
}
