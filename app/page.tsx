//app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">BindFlow</h1>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-gray-700 hover: text-blue-600"
            >
              Log In
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section  */}

      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Bookbinding Order Management
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          BindFlow helps staff manage production orders, quotes, deliveries, and
          payments — while clients track the progress of their jobs in real
          time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            Create Account
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-left">
            <h3 className="font-semibold text-lg mb-2">For Staff</h3>
            <p className="text-sm text-gray-600">
              Create orders, update production status, manage quotes, and record
              partial deliveries from one place.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-left">
            <h3 className="font-semibold text-lg mb-2">For Clients</h3>
            <p className="text-sm text-gray-600">
              Track the progress of your binding jobs easily and stay informed
              without calling the shop every time.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-left">
            <h3 className="font-semibold text-lg mb-2">For Admins</h3>
            <p className="text-sm text-gray-600">
              Oversee operations, review payments, and keep the production
              workflow organized and transparent.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BindFlow — Capstone Project
        </div>
      </footer>
    </div>
  );
}
