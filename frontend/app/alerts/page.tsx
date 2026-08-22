"use client";

import { useState } from "react";

type Medicine = {
  id: number;
  name: string;
  code: string;
  batch: string;
  quantity: number;
  minimum: number;
  expiry: string;
};

type AlertType =
  | "Out of Stock"
  | "Low Stock"
  | "Expired"
  | "Expiring Soon";

type Alert = {
  id: number;
  medicine: Medicine;
  type: AlertType;
  message: string;
};

export default function Page() {
  const [search, setSearch] = useState("");

  const [medicines] = useState<Medicine[]>([
    {
      id: 1,
      name: "Paracetamol 500mg",
      code: "PCM001",
      batch: "PCM2026A",
      quantity: 100,
      minimum: 20,
      expiry: "2027-06-30",
    },
    {
      id: 2,
      name: "Amoxicillin 500mg",
      code: "AMX002",
      batch: "AMX2026B",
      quantity: 15,
      minimum: 20,
      expiry: "2027-02-15",
    },
    {
      id: 3,
      name: "ORS Sachets",
      code: "ORS003",
      batch: "ORS2026C",
      quantity: 8,
      minimum: 20,
      expiry: "2026-09-10",
    },
    {
      id: 4,
      name: "Cetirizine 10mg",
      code: "CTZ004",
      batch: "CTZ2026D",
      quantity: 0,
      minimum: 20,
      expiry: "2027-04-20",
    },
    {
      id: 5,
      name: "Omeprazole 20mg",
      code: "OMP005",
      batch: "OMP2026E",
      quantity: 75,
      minimum: 20,
      expiry: "2028-01-10",
    },
    {
      id: 6,
      name: "Azithromycin 250mg",
      code: "AZI006",
      batch: "AZI2025F",
      quantity: 12,
      minimum: 20,
      expiry: "2026-08-01",
    },
  ]);

  // ================= DATE =================

  const today = new Date();

  // ================= DAYS UNTIL EXPIRY =================

  const getDaysUntilExpiry = (
    expiry: string
  ) => {
    const expiryDate = new Date(
      expiry
    );

    const difference =
      expiryDate.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  };

  // ================= CREATE ALERTS =================

  const alerts: Alert[] = [];

  medicines.forEach((medicine) => {
    const days =
      getDaysUntilExpiry(
        medicine.expiry
      );

    // EXPIRED

    if (days < 0) {
      alerts.push({
        id: medicine.id * 10 + 1,
        medicine,
        type: "Expired",
        message: `Expired ${Math.abs(
          days
        )} days ago`,
      });
    }

    // EXPIRING SOON

    else if (days <= 30) {
      alerts.push({
        id: medicine.id * 10 + 2,
        medicine,
        type: "Expiring Soon",
        message:
          days === 0
            ? "Expires today"
            : `Expires in ${days} days`,
      });
    }

    // OUT OF STOCK

    if (medicine.quantity === 0) {
      alerts.push({
        id: medicine.id * 10 + 3,
        medicine,
        type: "Out of Stock",
        message:
          "Medicine is currently unavailable",
      });
    }

    // LOW STOCK

    else if (
      medicine.quantity <=
      medicine.minimum
    ) {
      alerts.push({
        id: medicine.id * 10 + 4,
        medicine,
        type: "Low Stock",
        message: `Only ${medicine.quantity} units remaining`,
      });
    }
  });

  // ================= SEARCH =================

  const filteredAlerts =
    alerts.filter((alert) => {
      const searchText =
        search.toLowerCase();

      return (
        alert.medicine.name
          .toLowerCase()
          .includes(searchText) ||
        alert.medicine.code
          .toLowerCase()
          .includes(searchText) ||
        alert.medicine.batch
          .toLowerCase()
          .includes(searchText) ||
        alert.type
          .toLowerCase()
          .includes(searchText)
      );
    });

  // ================= ALERT COUNTS =================

  const expiredCount =
    alerts.filter(
      (alert) =>
        alert.type === "Expired"
    ).length;

  const expiringCount =
    alerts.filter(
      (alert) =>
        alert.type ===
        "Expiring Soon"
    ).length;

  const lowStockCount =
    alerts.filter(
      (alert) =>
        alert.type === "Low Stock"
    ).length;

  const outOfStockCount =
    alerts.filter(
      (alert) =>
        alert.type ===
        "Out of Stock"
    ).length;

  // ================= ALERT STYLE =================

  const getAlertStyle = (
    type: AlertType
  ) => {
    switch (type) {
      case "Expired":
        return {
          icon: "🔴",
          box: "border-red-200 bg-red-50",
          badge:
            "bg-red-100 text-red-700",
        };

      case "Expiring Soon":
        return {
          icon: "🟡",
          box:
            "border-yellow-200 bg-yellow-50",
          badge:
            "bg-yellow-100 text-yellow-700",
        };

      case "Out of Stock":
        return {
          icon: "⛔",
          box:
            "border-red-200 bg-red-50",
          badge:
            "bg-red-100 text-red-700",
        };

      case "Low Stock":
        return {
          icon: "🟠",
          box:
            "border-orange-200 bg-orange-50",
          badge:
            "bg-orange-100 text-orange-700",
        };
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* ================= HEADER ================= */}

      <div>

        <h1 className="text-3xl font-bold text-gray-800">
          🔔 Stock Alerts
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor medicine stock and expiry alerts
        </p>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* EXPIRED */}

        <div className="rounded-xl bg-red-50 p-5 shadow-sm">

          <p className="text-sm font-semibold text-red-700">
            🔴 Expired
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {expiredCount}
          </p>

          <p className="mt-1 text-xs text-red-600">
            Expired medicines
          </p>

        </div>

        {/* EXPIRING */}

        <div className="rounded-xl bg-yellow-50 p-5 shadow-sm">

          <p className="text-sm font-semibold text-yellow-700">
            🟡 Expiring Soon
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-700">
            {expiringCount}
          </p>

          <p className="mt-1 text-xs text-yellow-600">
            Within 30 days
          </p>

        </div>

        {/* LOW STOCK */}

        <div className="rounded-xl bg-orange-50 p-5 shadow-sm">

          <p className="text-sm font-semibold text-orange-700">
            🟠 Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-700">
            {lowStockCount}
          </p>

          <p className="mt-1 text-xs text-orange-600">
            Below minimum level
          </p>

        </div>

        {/* OUT OF STOCK */}

        <div className="rounded-xl bg-red-50 p-5 shadow-sm">

          <p className="text-sm font-semibold text-red-700">
            ⛔ Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {outOfStockCount}
          </p>

          <p className="mt-1 text-xs text-red-600">
            No stock available
          </p>

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="mt-6 rounded-xl bg-white p-4 shadow">

        <div className="relative">

          <span className="absolute left-4 top-3.5 text-gray-400">
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search medicine, code, batch or alert..."
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-500 outline-none focus:border-emerald-500"
          />

        </div>

      </div>

      {/* ================= ALERT LIST ================= */}

      <div className="mt-6 space-y-4">

        {filteredAlerts.length ===
        0 ? (

          <div className="rounded-xl bg-white p-12 text-center shadow">

            <div className="text-5xl">
              ✅
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No alerts found
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              All medicines are currently within safe levels.
            </p>

          </div>

        ) : (

          filteredAlerts.map(
            (alert) => {

              const style =
                getAlertStyle(
                  alert.type
                );

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-5 shadow-sm ${style.box}`}
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    {/* LEFT */}

                    <div className="flex gap-4">

                      <div className="text-3xl">
                        {style.icon}
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="font-bold text-gray-800">
                            {alert.medicine.name}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                          >
                            {alert.type}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                          {alert.message}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">

                          <span>
                            Code:{" "}
                            <b>
                              {alert.medicine.code}
                            </b>
                          </span>

                          <span>
                            Batch:{" "}
                            <b>
                              {alert.medicine.batch}
                            </b>
                          </span>

                          <span>
                            Quantity:{" "}
                            <b>
                              {alert.medicine.quantity}
                            </b>
                          </span>

                          <span>
                            Minimum:{" "}
                            <b>
                              {alert.medicine.minimum}
                            </b>
                          </span>

                          <span>
                            Expiry:{" "}
                            <b>
                              {alert.medicine.expiry}
                            </b>
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <button
                      onClick={() => {
                        alert(
                          `${alert.medicine.name}\n\nCode: ${alert.medicine.code}\nBatch: ${alert.medicine.batch}\nQuantity: ${alert.medicine.quantity}\nMinimum: ${alert.medicine.minimum}\nExpiry: ${alert.medicine.expiry}`
                        );
                      }}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-100"
                    >
                      View Details
                    </button>

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

    </main>
  );
}