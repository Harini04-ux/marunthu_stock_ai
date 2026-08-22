"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type PHC = {
  name: string;
  code: string;
  district: string;
  totalMedicines: number;
  lowStock: number;
  expiring: number;
  pendingIndent: number;
  status: "Good" | "Attention" | "Critical";
};

const phcData: PHC[] = [
  {
    name: "Primary Health Centre - TVL",
    code: "PHC-TVL-001",
    district: "Tiruvallur",
    totalMedicines: 1250,
    lowStock: 8,
    expiring: 4,
    pendingIndent: 2,
    status: "Attention",
  },
  {
    name: "Primary Health Centre - KAL",
    code: "PHC-KAL-002",
    district: "Kallakurichi",
    totalMedicines: 980,
    lowStock: 3,
    expiring: 2,
    pendingIndent: 1,
    status: "Good",
  },
  {
    name: "Primary Health Centre - CHE",
    code: "PHC-CHE-003",
    district: "Chennai",
    totalMedicines: 1450,
    lowStock: 12,
    expiring: 7,
    pendingIndent: 4,
    status: "Critical",
  },
  {
    name: "Primary Health Centre - KAN",
    code: "PHC-KAN-004",
    district: "Kanchipuram",
    totalMedicines: 1100,
    lowStock: 5,
    expiring: 3,
    pendingIndent: 2,
    status: "Attention",
  },
  {
    name: "Primary Health Centre - VEL",
    code: "PHC-VEL-005",
    district: "Vellore",
    totalMedicines: 890,
    lowStock: 2,
    expiring: 1,
    pendingIndent: 0,
    status: "Good",
  },
];

const stockChartData = [
  { name: "TVL", stock: 1250, low: 8 },
  { name: "KAL", stock: 980, low: 3 },
  { name: "CHE", stock: 1450, low: 12 },
  { name: "KAN", stock: 1100, low: 5 },
  { name: "VEL", stock: 890, low: 2 },
];

const statusData = [
  { name: "Good", value: 2 },
  { name: "Attention", value: 2 },
  { name: "Critical", value: 1 },
];

const PIE_COLORS = ["#16a34a", "#f59e0b", "#dc2626"];

export default function DHODashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPHCs = phcData.filter((phc) => {
    const matchesSearch =
      phc.name.toLowerCase().includes(search.toLowerCase()) ||
      phc.code.toLowerCase().includes(search.toLowerCase()) ||
      phc.district.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || phc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPHCs = phcData.length;

  const totalMedicines = phcData.reduce(
    (sum, phc) => sum + phc.totalMedicines,
    0
  );

  const totalLowStock = phcData.reduce(
    (sum, phc) => sum + phc.lowStock,
    0
  );

  const totalExpiring = phcData.reduce(
    (sum, phc) => sum + phc.expiring,
    0
  );

  const totalPendingIndent = phcData.reduce(
    (sum, phc) => sum + phc.pendingIndent,
    0
  );

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}

      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b bg-white">
        <div className="flex h-full items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏥</div>

            <div>
              <h1 className="text-sm font-bold text-emerald-700">
                Marunthu Stock AI
              </h1>

              <p className="text-[10px] text-gray-500">
                DHO Monitoring Dashboard
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">
              District Health Officer
            </p>

            <p className="text-[10px] text-gray-400">
              District Administration
            </p>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}

      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-44 border-r bg-white md:block">
        <nav className="p-3">
          <button className="mb-2 flex w-full items-center gap-2 rounded-md bg-emerald-600 px-3 py-3 text-left text-xs font-semibold text-white">
            📊
            <span>DHO Dashboard</span>
          </button>

          <button
            onClick={() => window.location.href = "/dashboard"}
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🏠
            <span>Pharmacist View</span>
          </button>

          <button
            onClick={() => window.location.href = "/alerts"}
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🔔
            <span>Alerts</span>
          </button>

          <button
            onClick={() => window.location.href = "/indent"}
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            📄
            <span>Indents</span>
          </button>

          <button
            onClick={() => window.location.href = "/"}
            className="mt-5 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-red-600 hover:bg-red-50"
          >
            🚪
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* MAIN */}

      <section className="pt-16 md:ml-44">
        <div className="p-4 md:p-6">
          {/* TITLE */}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              District Overview
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Monitor medicine stock and PHC performance across the district.
            </p>
          </div>

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border-l-4 border-blue-500 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total PHCs</p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {totalPHCs}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Registered PHCs
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-emerald-500 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total Medicines</p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {totalMedicines}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Available units
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Low Stock</p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {totalLowStock}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Need attention
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-orange-500 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Expiring Soon</p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {totalExpiring}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Within 30 days
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-purple-500 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Pending Indents</p>

              <p className="mt-2 text-2xl font-bold text-purple-600">
                {totalPendingIndent}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Awaiting action
              </p>
            </div>
          </div>

          {/* CHARTS */}

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
            {/* BAR CHART */}

            <div className="rounded-xl bg-white p-5 shadow-sm xl:col-span-2">
              <h3 className="mb-4 text-sm font-bold text-gray-800">
                PHC Medicine Stock
              </h3>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="stock"
                      name="Total Stock"
                      fill="#10b981"
                    />

                    <Bar
                      dataKey="low"
                      name="Low Stock"
                      fill="#ef4444"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART */}

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-800">
                PHC Status
              </h3>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SEARCH + FILTER */}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  PHC-wise Medicine Status
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Monitor each PHC individually.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="Search PHC..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-800 outline-none focus:border-emerald-500"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs text-gray-800 outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Good">Good</option>
                  <option value="Attention">Attention</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">
                      PHC
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Code
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      District
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Medicines
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Low Stock
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Expiring
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Indent
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPHCs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No PHCs found.
                      </td>
                    </tr>
                  ) : (
                    filteredPHCs.map((phc) => (
                      <tr
                        key={phc.code}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-xs font-semibold text-gray-800">
                          {phc.name}
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-500">
                          {phc.code}
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-600">
                          {phc.district}
                        </td>

                        <td className="px-4 py-4 text-xs font-bold text-gray-800">
                          {phc.totalMedicines}
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-red-600">
                          {phc.lowStock}
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-orange-600">
                          {phc.expiring}
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-purple-600">
                          {phc.pendingIndent}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                              phc.status === "Good"
                                ? "bg-green-100 text-green-700"
                                : phc.status === "Attention"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {phc.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CRITICAL ALERTS */}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Critical PHC Alerts
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  PHCs requiring immediate attention.
                </p>
              </div>

              <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold text-red-600">
                Priority
              </span>
            </div>

            {phcData
              .filter((phc) => phc.status === "Critical")
              .map((phc) => (
                <div
                  key={phc.code}
                  className="flex flex-col gap-3 rounded-lg bg-red-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-red-700">
                      🚨 {phc.name}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-600">
                      {phc.lowStock} low-stock medicines •{" "}
                      {phc.expiring} medicines expiring soon •{" "}
                      {phc.pendingIndent} pending indents
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-red-600">
                    CRITICAL
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}