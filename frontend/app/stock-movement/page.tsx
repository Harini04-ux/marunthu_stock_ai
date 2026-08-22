"use client";

import { useEffect, useState } from "react";
import {
  getMedicines,
  saveMedicines,
  type Medicine,
} from "@/lib/medicineStore";

export default function StockPage() {
  const [stock, setStock] = useState<Medicine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [stockType, setStockType] = useState<"IN" | "OUT">("IN");

  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");

  // ================= LOAD MEDICINES =================

  useEffect(() => {
    setStock(getMedicines());
  }, []);

  // ================= STATUS =================

  const getStatus = (item: Medicine) => {
    if (item.quantity === 0) {
      return "Out of Stock";
    }

    if (item.quantity <= item.minimum) {
      return "Low Stock";
    }

    return "In Stock";
  };

  // ================= STOCK UPDATE =================

  const handleStockUpdate = () => {
    if (!selectedId || !amount || Number(amount) <= 0) {
      alert("Please select medicine and enter valid quantity");
      return;
    }

    const quantity = Number(amount);

    const selectedMedicine = stock.find(
      (item) => item.id === Number(selectedId)
    );

    if (!selectedMedicine) {
      alert("Medicine not found");
      return;
    }

    // Prevent stock out greater than available stock
    if (
      stockType === "OUT" &&
      quantity > selectedMedicine.quantity
    ) {
      alert(
        `Only ${selectedMedicine.quantity} units are available!`
      );
      return;
    }

    const updatedStock = stock.map((item) => {
      if (item.id !== Number(selectedId)) {
        return item;
      }

      const newQuantity =
        stockType === "IN"
          ? item.quantity + quantity
          : item.quantity - quantity;

      return {
        ...item,
        quantity: newQuantity,
      };
    });

    // Update UI
    setStock(updatedStock);

    // Save to localStorage
    saveMedicines(updatedStock);

    alert(
      stockType === "IN"
        ? "Stock added successfully!"
        : "Stock removed successfully!"
    );

    setSelectedId("");
    setAmount("");
    setShowForm(false);
  };

  // ================= SUMMARY =================

  const totalMedicines = stock.length;

  const totalUnits = stock.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const lowStock = stock.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <= item.minimum
  ).length;

  const outOfStock = stock.filter(
    (item) => item.quantity === 0
  ).length;

  // ================= UI =================

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-800">
          Stock Management
        </h1>

        <p className="mt-2 text-gray-600">
          Manage medicine stock in and stock out
        </p>

      </div>

      {/* SUMMARY */}

      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-4">

        {/* TOTAL MEDICINES */}

        <div className="rounded-xl border-l-4 border-blue-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Total Medicines
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalMedicines}
          </p>

        </div>

        {/* TOTAL UNITS */}

        <div className="rounded-xl border-l-4 border-green-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Total Units
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {totalUnits}
          </p>

        </div>

        {/* LOW STOCK */}

        <div className="rounded-xl border-l-4 border-yellow-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {lowStock}
          </p>

        </div>

        {/* OUT OF STOCK */}

        <div className="rounded-xl border-l-4 border-red-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {outOfStock}
          </p>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow">

        <div className="flex flex-col gap-3 md:flex-row">

          <button
            onClick={() => {
              setStockType("IN");
              setShowForm(true);
            }}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            + Stock In
          </button>

          <button
            onClick={() => {
              setStockType("OUT");
              setShowForm(true);
            }}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            - Stock Out
          </button>

        </div>

      </div>

      {/* STOCK FORM */}

      {showForm && (

        <div className="mb-6 rounded-xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-bold text-gray-800">

            {stockType === "IN"
              ? "Add Stock"
              : "Remove Stock"}

          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* MEDICINE */}

            <select
              value={selectedId}
              onChange={(e) =>
                setSelectedId(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-800 outline-none"
            >

              <option value="">
                Select Medicine
              </option>

              {stock.map((item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} - {item.code}
                </option>

              ))}

            </select>

            {/* QUANTITY */}

            <input
              type="number"
              min="1"
              placeholder="Enter Quantity"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500 outline-none"
            />

          </div>

          {/* BUTTONS */}

          <div className="mt-5 flex gap-3">

            <button
              onClick={handleStockUpdate}
              className={`rounded-lg px-6 py-3 font-semibold text-white ${
                stockType === "IN"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {stockType === "IN"
                ? "Add Stock"
                : "Remove Stock"}
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setSelectedId("");
                setAmount("");
              }}
              className="rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white hover:bg-gray-600"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

      {/* TABLE */}

      <div className="overflow-x-auto rounded-xl bg-white shadow">

        <table className="w-full min-w-[1000px]">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="px-6 py-4 text-left">
                Medicine
              </th>

              <th className="px-6 py-4 text-left">
                Code
              </th>

              <th className="px-6 py-4 text-left">
                Batch
              </th>

              <th className="px-6 py-4 text-left">
                Current Stock
              </th>

              <th className="px-6 py-4 text-left">
                Minimum Stock
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-left">
                Expiry
              </th>

            </tr>

          </thead>

          <tbody>

            {stock.length === 0 ? (

              <tr>

                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No medicines available.
                </td>

              </tr>

            ) : (

              stock.map((item) => {

                const status = getStatus(item);

                return (

                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 font-semibold text-gray-800">
                      💊 {item.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.code}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.batch}
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-800">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.minimum}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "In Stock"
                            ? "bg-green-100 text-green-700"
                            : status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.expiry}
                    </td>

                  </tr>

                );
              })

            )}

          </tbody>

        </table>

      </div>

    </main>
  );
}