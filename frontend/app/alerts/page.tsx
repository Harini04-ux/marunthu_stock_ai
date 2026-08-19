"use client";

import { useEffect, useMemo, useState } from "react";

type Medicine = {
  id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  reorder_level: number;
};

type AlertType =
  | "Out of Stock"
  | "Low Stock"
  | "Expired"
  | "Expiry Soon";

type Priority = "High" | "Medium";

type MedicineAlert = Medicine & {
  alertType: AlertType;
  message: string;
  priority: Priority;
};

const API_URL = "http://10.125.207.102:8000";

export default function AlertsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");

  // =====================================================
  // GET MEDICINES
  // =====================================================

  const fetchMedicines = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_URL}/medicines`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const data: Medicine[] = await response.json();

      console.log("Alert medicines:", data);

      setMedicines(data);
    } catch (err) {
      console.error("Alert fetch error:", err);

      setError(
        "Unable to connect to backend. Make sure backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // =====================================================
  // GET DAYS LEFT
  // =====================================================

  const getDaysLeft = (expiryDate: string) => {
    if (!expiryDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (isNaN(expiry.getTime())) {
      return null;
    }

    const difference =
      expiry.getTime() - today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  // =====================================================
  // CREATE ALERTS
  // =====================================================

  const alerts = useMemo(() => {
    const result: MedicineAlert[] = [];

    medicines.forEach((medicine) => {
      const daysLeft = getDaysLeft(
        medicine.expiry_date
      );

      // -----------------------------------------------
      // OUT OF STOCK
      // -----------------------------------------------

      if (medicine.quantity === 0) {
        result.push({
          ...medicine,
          alertType: "Out of Stock",
          message:
            "Medicine is completely out of stock.",
          priority: "High",
        });
      }

      // -----------------------------------------------
      // LOW STOCK
      // -----------------------------------------------

      if (
        medicine.quantity > 0 &&
        medicine.quantity <= medicine.reorder_level
      ) {
        result.push({
          ...medicine,
          alertType: "Low Stock",
          message: `Only ${medicine.quantity} units remaining.`,
          priority: "High",
        });
      }

      // -----------------------------------------------
      // INVALID EXPIRY
      // -----------------------------------------------

      if (daysLeft === null) {
        return;
      }

      // -----------------------------------------------
      // EXPIRED
      // -----------------------------------------------

      if (daysLeft < 0) {
        result.push({
          ...medicine,
          alertType: "Expired",
          message:
            "Medicine expiry date has passed.",
          priority: "High",
        });

        return;
      }

      // -----------------------------------------------
      // EXPIRY TODAY
      // -----------------------------------------------

      if (daysLeft === 0) {
        result.push({
          ...medicine,
          alertType: "Expiry Soon",
          message:
            "Medicine expires today.",
          priority: "High",
        });

        return;
      }

      // -----------------------------------------------
      // EXPIRY SOON
      // -----------------------------------------------

      if (daysLeft <= 30) {
        result.push({
          ...medicine,
          alertType: "Expiry Soon",
          message: `Medicine expires in ${daysLeft} days.`,
          priority: "Medium",
        });
      }
    });

    return result;
  }, [medicines]);

  // =====================================================
  // FILTER ALERTS
  // =====================================================

  const filteredAlerts = useMemo(() => {
    if (filter === "All") {
      return alerts;
    }

    return alerts.filter(
      (alert) => alert.alertType === filter
    );
  }, [alerts, filter]);

  // =====================================================
  // ALERT COUNTS
  // =====================================================

  const outOfStockCount = alerts.filter(
    (alert) =>
      alert.alertType === "Out of Stock"
  ).length;

  const lowStockCount = alerts.filter(
    (alert) =>
      alert.alertType === "Low Stock"
  ).length;

  const expiredCount = alerts.filter(
    (alert) =>
      alert.alertType === "Expired"
  ).length;

  const expirySoonCount = alerts.filter(
    (alert) =>
      alert.alertType === "Expiry Soon"
  ).length;

  const totalAlerts = alerts.length;

  // =====================================================
  // ALERT STYLE
  // =====================================================

  const getAlertStyle = (
    type: AlertType
  ) => {
    switch (type) {
      case "Out of Stock":
        return {
          icon: "🚨",
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700",
          title: "text-red-700",
        };

      case "Low Stock":
        return {
          icon: "⚠️",
          bg: "bg-orange-50",
          border: "border-orange-200",
          badge:
            "bg-orange-100 text-orange-700",
          title: "text-orange-700",
        };

      case "Expired":
        return {
          icon: "❌",
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700",
          title: "text-red-700",
        };

      case "Expiry Soon":
        return {
          icon: "⏰",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          badge:
            "bg-yellow-100 text-yellow-700",
          title: "text-yellow-700",
        };
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 md:p-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
            <div className="text-5xl">⏳</div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Loading Alerts...
            </h2>

            <p className="mt-2 text-gray-500">
              Checking medicine stock and expiry
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            🔔 Medicine Alerts
          </h1>

          <p className="mt-1 text-gray-500">
            Monitor stock levels and medicine expiry
          </p>
        </div>

        <button
          onClick={() => fetchMedicines(true)}
          disabled={refreshing}
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing
            ? "⏳ Refreshing..."
            : "🔄 Refresh"}
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">

          <p className="font-semibold text-red-700">
            ❌ {error}
          </p>

          <p className="mt-1 text-sm text-red-600">
            Backend: {API_URL}
          </p>

          <button
            onClick={() => fetchMedicines()}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          TOTAL ALERTS
      ================================================= */}

      <div className="mt-6 rounded-xl bg-white p-5 shadow">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Total Active Alerts
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-800">
              {totalAlerts}
            </p>
          </div>

          <div className="rounded-full bg-emerald-100 p-4 text-3xl">
            🔔
          </div>

        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* OUT OF STOCK */}

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold text-red-600">
                Out of Stock
              </p>

              <p className="mt-2 text-3xl font-bold text-red-700">
                {outOfStockCount}
              </p>
            </div>

            <div className="text-3xl">
              🚨
            </div>

          </div>
        </div>

        {/* LOW STOCK */}

        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold text-orange-600">
                Low Stock
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-700">
                {lowStockCount}
              </p>
            </div>

            <div className="text-3xl">
              ⚠️
            </div>

          </div>
        </div>

        {/* EXPIRED */}

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold text-red-600">
                Expired
              </p>

              <p className="mt-2 text-3xl font-bold text-red-700">
                {expiredCount}
              </p>
            </div>

            <div className="text-3xl">
              ❌
            </div>

          </div>
        </div>

        {/* EXPIRY SOON */}

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold text-yellow-600">
                Expiry Soon
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-700">
                {expirySoonCount}
              </p>
            </div>

            <div className="text-3xl">
              ⏰
            </div>

          </div>
        </div>
      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="mt-6 rounded-xl bg-white p-5 shadow">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold text-gray-800">
              Alert List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredAlerts.length} alert(s) found
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
          >
            <option value="All">
              All Alerts
            </option>

            <option value="Out of Stock">
              Out of Stock
            </option>

            <option value="Low Stock">
              Low Stock
            </option>

            <option value="Expired">
              Expired
            </option>

            <option value="Expiry Soon">
              Expiry Soon
            </option>
          </select>

        </div>
      </div>

      {/* =================================================
          ALERT LIST
      ================================================= */}

      <div className="mt-6 space-y-4">

        {filteredAlerts.length === 0 ? (

          <div className="rounded-2xl bg-white p-12 text-center shadow">

            <div className="text-6xl">
              ✅
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No Alerts
            </h2>

            <p className="mt-2 text-gray-500">
              All medicines are currently in good condition.
            </p>

          </div>

        ) : (

          filteredAlerts.map((alert) => {

            const style =
              getAlertStyle(
                alert.alertType
              );

            const daysLeft =
              getDaysLeft(
                alert.expiry_date
              );

            return (
              <div
                key={`${alert.id}-${alert.alertType}`}
                className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${style.bg} ${style.border}`}
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* LEFT SIDE */}

                  <div className="flex items-start gap-4">

                    <div className="text-4xl">
                      {style.icon}
                    </div>

                    <div className="min-w-0">

                      {/* NAME + BADGE */}

                      <div className="flex flex-wrap items-center gap-2">

                        <h3
                          className={`text-lg font-bold ${style.title}`}
                        >
                          {alert.medicine_name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                        >
                          {alert.alertType}
                        </span>

                      </div>

                      {/* MESSAGE */}

                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {alert.message}
                      </p>

                      {/* DETAILS */}

                      <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">

                        <div>
                          <span className="font-semibold">
                            Batch:
                          </span>{" "}
                          {alert.batch_number}
                        </div>

                        <div>
                          <span className="font-semibold">
                            Quantity:
                          </span>{" "}
                          {alert.quantity}
                        </div>

                        <div>
                          <span className="font-semibold">
                            Reorder:
                          </span>{" "}
                          {alert.reorder_level}
                        </div>

                        <div>
                          <span className="font-semibold">
                            Expiry:
                          </span>{" "}
                          {alert.expiry_date}
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* RIGHT SIDE */}

                  <div className="rounded-lg bg-white/70 p-4 lg:min-w-[150px] lg:text-right">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Priority
                    </p>

                    <p
                      className={`mt-1 font-bold ${
                        alert.priority === "High"
                          ? "text-red-700"
                          : "text-yellow-700"
                      }`}
                    >
                      {alert.priority === "High"
                        ? "🔴 High"
                        : "🟡 Medium"}
                    </p>

                    {alert.alertType ===
                      "Expiry Soon" &&
                      daysLeft !== null && (
                        <p className="mt-2 text-sm font-semibold text-yellow-700">
                          {daysLeft === 0
                            ? "Expires today"
                            : `${daysLeft} days remaining`}
                        </p>
                      )}

                    {alert.alertType ===
                      "Expired" &&
                      daysLeft !== null && (
                        <p className="mt-2 text-sm font-semibold text-red-700">
                          Expired
                        </p>
                      )}

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </main>
  );
}