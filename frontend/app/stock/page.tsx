"use client";

import { useEffect, useState } from "react";

import {
  getMedicines,
  saveMedicines,
  type Medicine,
} from "@/lib/medicineStore";

type StockType = "IN" | "OUT";

export default function StockPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [stockType, setStockType] =
    useState<StockType>("IN");

  const [selectedCode, setSelectedCode] =
    useState("");

  const [amount, setAmount] = useState("");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] =
    useState("name");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 5;

  // ================= LOAD MEDICINES =================

  useEffect(() => {
    const data = getMedicines();
    setMedicines(data);
  }, []);

  // ================= STATUS =================

  const getStatus = (
    medicine: Medicine
  ) => {
    if (medicine.quantity === 0) {
      return {
        text: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (
      medicine.quantity <=
      medicine.minimum
    ) {
      return {
        text: "Low Stock",
        className:
          "bg-orange-100 text-orange-700",
      };
    }

    return {
      text: "In Stock",
      className:
        "bg-green-100 text-green-700",
    };
  };

  // ================= STOCK UPDATE =================

  const handleStockUpdate = () => {
    if (
      !selectedCode ||
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        "Please select medicine and enter valid quantity"
      );
      return;
    }

    const quantity = Number(amount);

    const selectedMedicine =
      medicines.find(
        (medicine) =>
          medicine.code === selectedCode
      );

    if (!selectedMedicine) {
      alert("Medicine not found");
      return;
    }

    // STOCK OUT VALIDATION

    if (
      stockType === "OUT" &&
      quantity >
        selectedMedicine.quantity
    ) {
      alert(
        "Stock quantity is not enough!"
      );
      return;
    }

    const updatedMedicines =
      medicines.map((medicine) => {
        if (
          medicine.code !==
          selectedCode
        ) {
          return medicine;
        }

        const newQuantity =
          stockType === "IN"
            ? medicine.quantity +
              quantity
            : medicine.quantity -
              quantity;

        return {
          ...medicine,
          quantity: newQuantity,
        };
      });

    setMedicines(updatedMedicines);

    saveMedicines(updatedMedicines);

    alert(
      stockType === "IN"
        ? "Stock added successfully!"
        : "Stock removed successfully!"
    );

    setSelectedCode("");
    setAmount("");
    setShowForm(false);
  };

  // ================= SEARCH =================

  const filteredMedicines =
    medicines.filter(
      (medicine) =>
        medicine.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        medicine.code
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        medicine.batch
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        medicine.category
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // ================= SORT =================

  const sortedMedicines = [
    ...filteredMedicines,
  ].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(
        b.name
      );
    }

    if (sortBy === "quantity") {
      return (
        a.quantity - b.quantity
      );
    }

    if (sortBy === "expiry") {
      return (
        new Date(a.expiry).getTime() -
        new Date(b.expiry).getTime()
      );
    }

    return 0;
  });

  // ================= PAGINATION =================

  const totalPages = Math.ceil(
    sortedMedicines.length /
      itemsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const currentMedicines =
    sortedMedicines.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // ================= SUMMARY =================

  const totalMedicines =
    medicines.length;

  const totalUnits =
    medicines.reduce(
      (total, medicine) =>
        total + medicine.quantity,
      0
    );

  const lowStock =
    medicines.filter(
      (medicine) =>
        medicine.quantity > 0 &&
        medicine.quantity <=
          medicine.minimum
    ).length;

  const outOfStock =
    medicines.filter(
      (medicine) =>
        medicine.quantity === 0
    ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* ================= HEADER ================= */}

      <div className="mb-7">

        <h1 className="text-3xl font-bold text-gray-800">
          📦 Stock Management
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Manage medicine stock in and stock out
        </p>

      </div>


      {/* ================= SUMMARY ================= */}

      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-xl border-l-4 border-blue-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Total Medicines
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalMedicines}
          </p>

        </div>


        <div className="rounded-xl border-l-4 border-green-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Total Units
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {totalUnits}
          </p>

        </div>


        <div className="rounded-xl border-l-4 border-orange-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {lowStock}
          </p>

        </div>


        <div className="rounded-xl border-l-4 border-red-500 bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {outOfStock}
          </p>

        </div>

      </div>


      {/* ================= SEARCH + SORT ================= */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow">

        <div className="flex flex-col gap-3 md:flex-row">

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setCurrentPage(1);
            }}
            placeholder="Search medicine, code, batch or category..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-emerald-500"
          />

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(
                e.target.value
              );
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-emerald-500"
          >

            <option value="name">
              Sort by Name
            </option>

            <option value="quantity">
              Sort by Quantity
            </option>

            <option value="expiry">
              Sort by Expiry
            </option>

          </select>

        </div>

      </div>


      {/* ================= ACTION BUTTONS ================= */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow">

        <div className="flex flex-col gap-3 md:flex-row">

          <button
            onClick={() => {
              setStockType("IN");
              setSelectedCode("");
              setAmount("");
              setShowForm(true);
            }}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            + Stock In
          </button>


          <button
            onClick={() => {
              setStockType("OUT");
              setSelectedCode("");
              setAmount("");
              setShowForm(true);
            }}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            − Stock Out
          </button>

        </div>

      </div>


      {/* ================= STOCK FORM ================= */}

      {showForm && (

        <div className="mb-6 rounded-xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-bold text-gray-800">

            {stockType === "IN"
              ? "➕ Add Stock"
              : "➖ Remove Stock"}

          </h2>


          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <select
              value={selectedCode}
              onChange={(e) =>
                setSelectedCode(
                  e.target.value
                )
              }
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-800 outline-none focus:border-emerald-500"
            >

              <option value="">
                Select Medicine
              </option>

              {medicines.map(
                (medicine) => (

                  <option
                    key={medicine.id}
                    value={
                      medicine.code
                    }
                  >
                    {medicine.name} -
                    {" "}
                    {medicine.code}
                  </option>

                )
              )}

            </select>


            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="Enter Quantity"
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-800 placeholder:text-gray-500 outline-none focus:border-emerald-500"
            />

          </div>


          <div className="mt-5 flex gap-3">

            <button
              onClick={
                handleStockUpdate
              }
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
                setSelectedCode("");
                setAmount("");
              }}
              className="rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white hover:bg-gray-600"
            >
              Cancel
            </button>

          </div>

        </div>

      )}


      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto rounded-xl bg-white shadow">

        <table className="w-full min-w-[1100px]">

          <thead className="bg-emerald-600 text-white">

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
                Category
              </th>

              <th className="px-6 py-4 text-left">
                Current Stock
              </th>

              <th className="px-6 py-4 text-left">
                Minimum
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

            {currentMedicines.length ===
            0 ? (

              <tr>

                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No medicines found.
                </td>

              </tr>

            ) : (

              currentMedicines.map(
                (medicine) => {

                  const status =
                    getStatus(
                      medicine
                    );

                  return (

                    <tr
                      key={medicine.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-semibold text-gray-800">
                        💊{" "}
                        {medicine.name}
                      </td>


                      <td className="px-6 py-4 text-gray-600">
                        {medicine.code}
                      </td>


                      <td className="px-6 py-4 text-gray-600">
                        {medicine.batch}
                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          {
                            medicine.category
                          }
                        </span>

                      </td>


                      <td className="px-6 py-4 text-xl font-bold text-gray-800">
                        {
                          medicine.quantity
                        }
                      </td>


                      <td className="px-6 py-4 font-semibold text-gray-600">
                        {
                          medicine.minimum
                        }
                      </td>


                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {
                            status.text
                          }
                        </span>

                      </td>


                      <td className="px-6 py-4 text-gray-600">
                        {medicine.expiry}
                      </td>

                    </tr>

                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>


      {/* ================= PAGINATION ================= */}

      {totalPages > 1 && (

        <div className="mt-5 flex items-center justify-center gap-2">

          <button
            disabled={
              currentPage === 1
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  page - 1
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>


          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (

            <button
              key={page}
              onClick={() =>
                setCurrentPage(
                  page
                )
              }
              className={`rounded-lg px-4 py-2 font-semibold ${
                currentPage === page
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>

          ))}


          <button
            disabled={
              currentPage ===
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  page + 1
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>

        </div>

      )}


      {/* ================= INFO ================= */}

      <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">

        <p className="font-semibold text-blue-700">
          💡 Stock Information
        </p>

        <p className="mt-1 text-sm text-blue-600">
          Stock In increases the medicine
          quantity. Stock Out decreases the
          quantity. Changes are automatically
          saved and synchronized with Medicine
          Stock.
        </p>

      </div>

    </main>
  );
}