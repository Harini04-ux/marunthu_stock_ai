"use client";

import { useEffect, useState } from "react";
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

const API_URL = " http://10.125.207.102:8001";

type Dashboard = {
  total_phcs: number;
  total_medicines: number;
  total_stock: number;
  low_stock: number;
  expiring_soon: number;
  pending_indents: number;
  approved_indents: number;
  rejected_indents: number;
};

type PHCData = {
  phc_code: string;
  total_medicines: number;
  total_stock: number;
  low_stock: number;
  expiring_soon: number;
  pending_indents: number;
  status: string;
};

type Indent = {
  id: number;
  indent_number: string;
  medicine_id: number;
  requested_quantity: number;
  current_stock: number;
  predicted_quantity: number;
  priority: "High" | "Medium" | "Low";
  reason: string;
  status: string;
  requested_date: string;
};

type Medicine = {
  id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  reorder_level: number;
  expiry_date: string;
};

type DHOResponse = {
  success: boolean;
  dashboard: Dashboard;
  phc_wise_data: PHCData[];
  indent_status: {
    Pending: number;
    Approved: number;
    Rejected: number;
  };
  low_stock_medicines: Medicine[];
  expiring_medicines: Medicine[];
  pending_indent_details: Indent[];
};

const PIE_COLORS = ["#f59e0b", "#16a34a", "#dc2626"];

export default function DHODashboard() {
  const [data, setData] = useState<DHOResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // =====================================================
  // FETCH DHO DASHBOARD
  // =====================================================

  const fetchDHODashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/dho/dashboard`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `DHO dashboard fetch failed: ${response.status}`
        );
      }

      const result: DHOResponse = await response.json();

      console.log("DHO Dashboard Response:", result);

      if (!result.success) {
        throw new Error("Backend returned success=false");
      }

      setData(result);
    } catch (err) {
      console.error("DHO dashboard error:", err);

      setError(
        "Unable to load DHO dashboard from backend."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDHODashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <div className="text-5xl">⏳</div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Loading DHO Dashboard...
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Connecting to backend
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="max-w-md rounded-xl bg-white p-8 text-center shadow">
            <div className="text-5xl">❌</div>

            <h2 className="mt-4 text-xl font-bold text-red-600">
              DHO Dashboard Error
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              {error}
            </p>

            <button
              onClick={fetchDHODashboard}
              className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const dashboard = data.dashboard;

  // =====================================================
  // FILTER PHC
  // =====================================================

  const filteredPHCs = data.phc_wise_data.filter((phc) => {
    const matchesSearch =
      phc.phc_code
        .toLowerCase()
        .includes(search.toLowerCase());

    let status = "Good";

    if (phc.status === "LOW_STOCK") {
      status = "Attention";
    }

    if (
      phc.low_stock >= 10 ||
      phc.expiring_soon >= 10
    ) {
      status = "Critical";
    }

    const matchesStatus =
      statusFilter === "All" ||
      status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =====================================================
  // STOCK CHART
  // =====================================================

  const stockChartData = data.phc_wise_data.map(
    (phc) => ({
      name: phc.phc_code.replace("PHC-", ""),
      stock: phc.total_stock,
      low: phc.low_stock,
    })
  );

  // =====================================================
  // INDENT CHART
  // =====================================================

  const indentChartData = [
    {
      name: "Pending",
      value: data.indent_status.Pending,
    },
    {
      name: "Approved",
      value: data.indent_status.Approved,
    },
    {
      name: "Rejected",
      value: data.indent_status.Rejected,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b bg-white">
        <div className="flex h-full items-center justify-between px-5">

          <div className="flex items-center gap-3">

            <div className="text-2xl">
              🏥
            </div>

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

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-48 border-r bg-white md:block">

        <nav className="p-3">

          <button
            className="mb-2 flex w-full items-center gap-2 rounded-md bg-emerald-600 px-3 py-3 text-left text-xs font-semibold text-white"
          >
            📊
            <span>DHO Dashboard</span>
          </button>

          <button
            onClick={() =>
              (window.location.href = "/dashboard")
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🏠
            <span>Pharmacist View</span>
          </button>

          <button
            onClick={() =>
              (window.location.href = "/alerts")
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🔔
            <span>Alerts</span>
          </button>

          <button
            onClick={() =>
              (window.location.href = "/indent")
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            📄
            <span>Indents</span>
          </button>

          <button
            onClick={() =>
              (window.location.href = "/")
            }
            className="mt-5 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-xs text-red-600 hover:bg-red-50"
          >
            🚪
            <span>Logout</span>
          </button>

        </nav>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <section className="pt-16 md:ml-48">

        <div className="p-4 md:p-6">

          {/* TITLE */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                District Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Live medicine stock monitoring from backend.
              </p>
            </div>

            <button
              onClick={fetchDHODashboard}
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              🔄 Refresh
            </button>

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

            {/* PHC */}

            <div className="rounded-xl border-l-4 border-blue-500 bg-white p-4 shadow-sm">

              <p className="text-xs text-gray-500">
                Total PHCs
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {dashboard.total_phcs}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Registered PHCs
              </p>

            </div>

            {/* MEDICINES */}

            <div className="rounded-xl border-l-4 border-emerald-500 bg-white p-4 shadow-sm">

              <p className="text-xs text-gray-500">
                Total Medicines
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {dashboard.total_medicines}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Medicine records
              </p>

            </div>

            {/* STOCK */}

            <div className="rounded-xl border-l-4 border-indigo-500 bg-white p-4 shadow-sm">

              <p className="text-xs text-gray-500">
                Total Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-indigo-600">
                {dashboard.total_stock}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Available units
              </p>

            </div>

            {/* LOW STOCK */}

            <div className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm">

              <p className="text-xs text-gray-500">
                Low Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {dashboard.low_stock}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Need attention
              </p>

            </div>

            {/* EXPIRING */}

            <div className="rounded-xl border-l-4 border-orange-500 bg-white p-4 shadow-sm">

              <p className="text-xs text-gray-500">
                Expiring Soon
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {dashboard.expiring_soon}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Expiry alerts
              </p>

            </div>

          </div>

          {/* =================================================
              INDENT SUMMARY
          ================================================= */}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-xs text-purple-600">
                Pending Indents
              </p>

              <p className="mt-2 text-2xl font-bold text-purple-700">
                {dashboard.pending_indents}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs text-green-600">
                Approved Indents
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {dashboard.approved_indents}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-red-600">
                Rejected Indents
              </p>

              <p className="mt-2 text-2xl font-bold text-red-700">
                {dashboard.rejected_indents}
              </p>
            </div>

          </div>

          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">

            {/* BAR CHART */}

            <div className="rounded-xl bg-white p-5 shadow-sm xl:col-span-2">

              <h3 className="mb-4 text-sm font-bold text-gray-800">
                PHC Medicine Stock
              </h3>

              <div className="h-72 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart data={stockChartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

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
                Indent Status
              </h3>

              <div className="h-72 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={indentChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label
                    >

                      {indentChartData.map(
                        (entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              PIE_COLORS[index]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>

          {/* =================================================
              PHC TABLE
          ================================================= */}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>

                <h3 className="text-sm font-bold text-gray-800">
                  PHC-wise Medicine Status
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Live data from DHO backend API.
                </p>

              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                <input
                  type="text"
                  placeholder="Search PHC..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-800 outline-none focus:border-emerald-500"
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs text-gray-800 outline-none"
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="Good">
                    Good
                  </option>

                  <option value="Attention">
                    Attention
                  </option>

                  <option value="Critical">
                    Critical
                  </option>

                </select>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-emerald-600 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs">
                      PHC Code
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Medicines
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Total Stock
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Low Stock
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Expiring
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Pending Indent
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
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No PHCs found.
                      </td>

                    </tr>

                  ) : (

                    filteredPHCs.map((phc) => {

                      let displayStatus =
                        "Good";

                      if (
                        phc.status ===
                        "LOW_STOCK"
                      ) {
                        displayStatus =
                          "Attention";
                      }

                      if (
                        phc.low_stock >= 10 ||
                        phc.expiring_soon >= 10
                      ) {
                        displayStatus =
                          "Critical";
                      }

                      return (
                        <tr
                          key={phc.phc_code}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="px-4 py-4 text-xs font-semibold text-gray-800">
                            {phc.phc_code}
                          </td>

                          <td className="px-4 py-4 text-xs font-bold text-gray-800">
                            {phc.total_medicines}
                          </td>

                          <td className="px-4 py-4 text-xs font-bold text-indigo-600">
                            {phc.total_stock}
                          </td>

                          <td className="px-4 py-4 text-xs font-semibold text-red-600">
                            {phc.low_stock}
                          </td>

                          <td className="px-4 py-4 text-xs font-semibold text-orange-600">
                            {phc.expiring_soon}
                          </td>

                          <td className="px-4 py-4 text-xs font-semibold text-purple-600">
                            {phc.pending_indents}
                          </td>

                          <td className="px-4 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                                displayStatus ===
                                "Good"
                                  ? "bg-green-100 text-green-700"
                                  : displayStatus ===
                                    "Attention"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {displayStatus}
                            </span>

                          </td>

                        </tr>
                      );
                    })

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              LOW STOCK MEDICINES
          ================================================= */}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">

            <h3 className="text-sm font-bold text-gray-800">
              ⚠️ Low Stock Medicines
            </h3>

            <p className="mt-1 text-[10px] text-gray-400">
              Medicines below reorder level.
            </p>

            <div className="mt-4 overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="bg-red-600 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs">
                      Medicine
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Batch
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Reorder Level
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Expiry
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data.low_stock_medicines.map(
                    (medicine) => (

                      <tr
                        key={medicine.id}
                        className="border-b hover:bg-red-50"
                      >

                        <td className="px-4 py-3 text-xs font-semibold text-gray-800">
                          {medicine.medicine_name}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500">
                          {medicine.batch_number}
                        </td>

                        <td className="px-4 py-3 text-xs font-bold text-red-600">
                          {medicine.quantity}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-700">
                          {medicine.reorder_level}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-700">
                          {medicine.expiry_date}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              EXPIRING MEDICINES
          ================================================= */}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">

            <h3 className="text-sm font-bold text-gray-800">
              ⏰ Expiring Medicines
            </h3>

            <p className="mt-1 text-[10px] text-gray-400">
              Medicines requiring expiry attention.
            </p>

            <div className="mt-4 overflow-x-auto">

              <table className="w-full min-w-[600px]">

                <thead className="bg-orange-500 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs">
                      Medicine
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Batch
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Expiry Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data.expiring_medicines.map(
                    (medicine) => (

                      <tr
                        key={medicine.id}
                        className="border-b hover:bg-orange-50"
                      >

                        <td className="px-4 py-3 text-xs font-semibold text-gray-800">
                          {medicine.medicine_name}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500">
                          {medicine.batch_number}
                        </td>

                        <td className="px-4 py-3 text-xs font-bold text-gray-800">
                          {medicine.quantity}
                        </td>

                        <td className="px-4 py-3 text-xs font-semibold text-orange-600">
                          {medicine.expiry_date}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              RECENT PENDING INDENTS
          ================================================= */}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-sm font-bold text-gray-800">
                  📄 Recent Indent Requests
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Pending indent requests from backend.
                </p>

              </div>

              <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-bold text-purple-700">
                {data.pending_indent_details.length} Pending
              </span>

            </div>

            <div className="mt-4 overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead className="bg-purple-600 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs">
                      Indent No
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Medicine ID
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Requested
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Current
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Predicted
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Priority
                    </th>

                    <th className="px-4 py-3 text-left text-xs">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data.pending_indent_details.length ===
                  0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No pending indents.
                      </td>

                    </tr>

                  ) : (

                    data.pending_indent_details.map(
                      (indent) => (

                        <tr
                          key={indent.id}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="px-4 py-4 text-xs font-bold text-gray-800">
                            {indent.indent_number}
                          </td>

                          <td className="px-4 py-4 text-xs text-gray-700">
                            #{indent.medicine_id}
                          </td>

                          <td className="px-4 py-4 text-xs font-bold text-gray-800">
                            {indent.requested_quantity}
                          </td>

                          <td className="px-4 py-4 text-xs text-gray-700">
                            {indent.current_stock}
                          </td>

                          <td className="px-4 py-4 text-xs text-blue-600">
                            {indent.predicted_quantity}
                          </td>

                          <td className="px-4 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                                indent.priority ===
                                "High"
                                  ? "bg-red-100 text-red-700"
                                  : indent.priority ===
                                    "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {indent.priority}
                            </span>

                          </td>

                          <td className="px-4 py-4">

                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-bold text-yellow-700">
                              {indent.status}
                            </span>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              CRITICAL ALERTS
          ================================================= */}

          {data.low_stock_medicines.length > 0 && (

            <div className="mt-6 rounded-xl bg-red-50 p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-bold text-red-800">
                    🚨 Critical PHC Alerts
                  </h3>

                  <p className="mt-1 text-[10px] text-red-600">
                    Medicines requiring immediate attention.
                  </p>

                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold text-red-700">
                  Priority
                </span>

              </div>

              <div className="rounded-lg bg-white p-4">

                <p className="text-xs font-bold text-red-700">
                  🚨 Low Stock Alert
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {dashboard.low_stock} medicines
                  are below reorder level.
                </p>

              </div>

              <div className="mt-3 rounded-lg bg-white p-4">

                <p className="text-xs font-bold text-orange-700">
                  ⏰ Expiry Alert
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {dashboard.expiring_soon} medicines
                  require expiry attention.
                </p>

              </div>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}