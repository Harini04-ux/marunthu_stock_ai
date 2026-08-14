"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Top Bar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-emerald-700">
            💊 Marunthu Stock AI
          </h1>

          <p className="text-xs text-gray-500">
            PHC Pharmacy Management System
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-800">
            Pharmacist
          </p>

          <p className="text-xs text-gray-500">
            PHC-TVL-001
          </p>
        </div>
      </header>

      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden md:block w-60 min-h-[calc(100vh-73px)] bg-white border-r p-4">

          <nav className="space-y-2">

            {/* Dashboard */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-left text-white font-medium"
            >
              🏠 Dashboard
            </button>

            {/* Medicines */}
            <button
              onClick={() => router.push("/medicine-stock")}
              className="w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-emerald-50"
            >
              💊 Medicines
            </button>

            {/* Stock */}
            <button
              onClick={() => router.push("/medicine-stock")}
              className="w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-emerald-50"
            >
              📦 Stock
            </button>

            {/* Bill OCR */}
            <button
              className="w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-emerald-50"
            >
              📷 Bill OCR
            </button>

            {/* AI Forecast */}
            <button
              className="w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-emerald-50"
            >
              🤖 AI Forecast
            </button>

            {/* Alerts */}
            <button
              className="w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-emerald-50"
            >
              🔔 Alerts
            </button>

            {/* Indent */}
            <button
              className="w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-emerald-50"
            >
              📄 Indent
            </button>

            {/* Logout */}
            <button
              onClick={() => router.push("/")}
              className="mt-8 w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50"
            >
              🚪 Logout
            </button>

          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 p-6">

          {/* Welcome */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, Pharmacist 👋
            </h2>

            <p className="text-gray-500">
              Here's your PHC medicine overview for today.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Low Stock */}
            <div className="rounded-xl bg-white p-5 shadow-sm border-l-4 border-red-500">
              <p className="text-sm text-gray-500">
                Low Stock
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                8
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Medicines need attention
              </p>
            </div>

            {/* Expiring Soon */}
            <div className="rounded-xl bg-white p-5 shadow-sm border-l-4 border-orange-500">
              <p className="text-sm text-gray-500">
                Expiring Soon
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-600">
                15
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Batches within 30 days
              </p>
            </div>

            {/* AI Forecast */}
            <div className="rounded-xl bg-white p-5 shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">
                AI Forecast Alerts
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                3
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Demand changes detected
              </p>
            </div>

            {/* Pending Indent */}
            <div className="rounded-xl bg-white p-5 shadow-sm border-l-4 border-emerald-500">
              <p className="text-sm text-gray-500">
                Pending Indent
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                1
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Awaiting submission
              </p>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

            <h3 className="text-lg font-bold text-gray-900">
              Quick Actions
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

              {/* Upload Bill */}
              <button className="rounded-lg bg-emerald-50 p-4 text-left hover:bg-emerald-100">
                <span className="text-2xl">
                  📷
                </span>

                <p className="mt-2 font-semibold text-emerald-700">
                  Upload Medicine Bill
                </p>

                <p className="text-xs text-gray-500">
                  Scan bill using OCR
                </p>
              </button>

              {/* AI Forecast */}
              <button className="rounded-lg bg-blue-50 p-4 text-left hover:bg-blue-100">
                <span className="text-2xl">
                  🤖
                </span>

                <p className="mt-2 font-semibold text-blue-700">
                  View AI Forecast
                </p>

                <p className="text-xs text-gray-500">
                  Check upcoming demand
                </p>
              </button>

              {/* Indent */}
              <button className="rounded-lg bg-purple-50 p-4 text-left hover:bg-purple-100">
                <span className="text-2xl">
                  📄
                </span>

                <p className="mt-2 font-semibold text-purple-700">
                  Create Indent
                </p>

                <p className="text-xs text-gray-500">
                  Generate medicine indent
                </p>
              </button>

            </div>
          </div>

          {/* Alerts */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

            <h3 className="text-lg font-bold text-gray-900">
              Recent Alerts
            </h3>

            <div className="mt-4 space-y-3">

              {/* Alert 1 */}
              <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">

                <div>
                  <p className="font-semibold text-red-700">
                    🔴 Paracetamol 500mg
                  </p>

                  <p className="text-sm text-gray-600">
                    Stock level is below minimum threshold.
                  </p>
                </div>

                <span className="text-xs font-semibold text-red-600">
                  HIGH
                </span>
              </div>

              {/* Alert 2 */}
              <div className="flex items-center justify-between rounded-lg bg-orange-50 p-4">

                <div>
                  <p className="font-semibold text-orange-700">
                    🟠 ORS Sachets
                  </p>

                  <p className="text-sm text-gray-600">
                    Batch expires within 30 days.
                  </p>
                </div>

                <span className="text-xs font-semibold text-orange-600">
                  WARNING
                </span>
              </div>

              {/* Alert 3 */}
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">

                <div>
                  <p className="font-semibold text-blue-700">
                    🔵 BP Medicine
                  </p>

                  <p className="text-sm text-gray-600">
                    AI predicts increased demand.
                  </p>
                </div>

                <span className="text-xs font-semibold text-blue-600">
                  AI
                </span>
              </div>

            </div>
          </div>

        </section>
      </div>
    </main>
  );
}