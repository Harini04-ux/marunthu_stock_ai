"use client";

import { useState } from "react";

const medicines = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    code: "PCM500",
    category: "Tablet",
    quantity: 850,
    minimum: 200,
    expiry: "Dec 2027",
    status: "Available",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    code: "AMX500",
    category: "Capsule",
    quantity: 120,
    minimum: 200,
    expiry: "Aug 2027",
    status: "Low Stock",
  },
  {
    id: 3,
    name: "ORS Sachet",
    code: "ORS001",
    category: "Sachet",
    quantity: 500,
    minimum: 150,
    expiry: "Mar 2028",
    status: "Available",
  },
  {
    id: 4,
    name: "Cetirizine 10mg",
    code: "CTZ010",
    category: "Tablet",
    quantity: 80,
    minimum: 100,
    expiry: "Jan 2027",
    status: "Low Stock",
  },
  {
    id: 5,
    name: "Azithromycin 500mg",
    code: "AZM500",
    category: "Tablet",
    quantity: 0,
    minimum: 100,
    expiry: "Nov 2026",
    status: "Out of Stock",
  },
];

export default function MedicineStock() {
  const [search, setSearch] = useState("");

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Medicine Stock
            </h1>

            <p className="mt-1 text-gray-600">
              Manage and monitor medicine inventory
            </p>
          </div>

          <button className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
            + Add Medicine
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Total Medicines</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              5
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Available</p>
            <h2 className="mt-2 text-3xl font-bold text-emerald-600">
              2
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Low Stock</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-500">
              2
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              1
            </h2>
          </div>

        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border">
          <input
            type="text"
            placeholder="Search medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Medicine Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border">
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Medicine
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Minimum
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Expiry
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {medicine.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {medicine.code}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {medicine.category}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {medicine.quantity}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {medicine.minimum}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {medicine.expiry}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          medicine.status === "Available"
                            ? "bg-emerald-100 text-emerald-700"
                            : medicine.status === "Low Stock"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {medicine.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button className="mr-3 text-blue-600 hover:underline">
                        Edit
                      </button>

                      <button className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </main>
  );
}