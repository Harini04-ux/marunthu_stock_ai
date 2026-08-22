"use client";

import { useState } from "react";

type IndentItem = {
  id: number;
  medicine: string;
  code: string;
  quantity: number;
  date: string;
  status: "Pending" | "Submitted";
};

const medicines = [
  { name: "Paracetamol 500mg", code: "PCM001" },
  { name: "Amoxicillin 500mg", code: "AMX002" },
  { name: "ORS Sachets", code: "ORS003" },
  { name: "Cetirizine 10mg", code: "CTZ004" },
  { name: "Omeprazole 20mg", code: "OMP005" },
];

export default function IndentPage() {
  const [indents, setIndents] = useState<IndentItem[]>([
    {
      id: 1,
      medicine: "Paracetamol 500mg",
      code: "PCM001",
      quantity: 100,
      date: "15-08-2026",
      status: "Pending",
    },
    {
      id: 2,
      medicine: "Amoxicillin 500mg",
      code: "AMX002",
      quantity: 50,
      date: "14-08-2026",
      status: "Submitted",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");

  const createIndent = () => {
    if (!selectedMedicine || !quantity || Number(quantity) <= 0) {
      alert("Please select medicine and enter valid quantity");
      return;
    }

    const medicine = medicines.find(
      (item) => item.code === selectedMedicine
    );

    if (!medicine) return;

    const newIndent: IndentItem = {
      id: Date.now(),
      medicine: medicine.name,
      code: medicine.code,
      quantity: Number(quantity),
      date: "15-08-2026",
      status: "Pending",
    };

    setIndents((prev) => [newIndent, ...prev]);

    setSelectedMedicine("");
    setQuantity("");
    setShowForm(false);

    alert("Indent created successfully!");
  };

  const submitIndent = (id: number) => {
    setIndents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "Submitted" }
          : item
      )
    );

    alert("Indent submitted successfully!");
  };

  const deleteIndent = (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this indent?"
    );

    if (!confirmDelete) return;

    setIndents((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const filteredIndents = indents.filter(
    (item) =>
      item.medicine
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.code
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const pendingCount = indents.filter(
    (item) => item.status === "Pending"
  ).length;

  const submittedCount = indents.filter(
    (item) => item.status === "Submitted"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-800">
          Indent Management
        </h1>

        <p className="mt-2 text-gray-600">
          Create and manage medicine indents
        </p>
      </div>


      {/* SUMMARY */}

      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border-l-4 border-blue-500 bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Indents
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {indents.length}
          </p>
        </div>


        <div className="rounded-xl border-l-4 border-yellow-500 bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingCount}
          </p>
        </div>


        <div className="rounded-xl border-l-4 border-green-500 bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Submitted
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {submittedCount}
          </p>
        </div>

      </div>


      {/* ACTION BAR */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            + Create Indent
          </button>


          <input
            type="text"
            placeholder="Search medicine or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 p-3 text-gray-800 outline-none focus:border-emerald-500 md:w-80"
          />

        </div>

      </div>


      {/* CREATE FORM */}

      {showForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-bold text-gray-800">
            Create New Indent
          </h2>


          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <select
              value={selectedMedicine}
              onChange={(e) =>
                setSelectedMedicine(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-800 outline-none"
            >

              <option value="">
                Select Medicine
              </option>

              {medicines.map((medicine) => (
                <option
                  key={medicine.code}
                  value={medicine.code}
                >
                  {medicine.name} - {medicine.code}
                </option>
              ))}

            </select>


            <input
              type="number"
              min="1"
              placeholder="Required Quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              className="rounded-lg border border-gray-300 p-3 text-gray-800 outline-none"
            />

          </div>


          <div className="mt-5 flex gap-3">

            <button
              onClick={createIndent}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Create Indent
            </button>


            <button
              onClick={() => {
                setShowForm(false);
                setSelectedMedicine("");
                setQuantity("");
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

        <table className="w-full min-w-[900px]">

          <thead className="bg-emerald-600 text-white">

            <tr>

              <th className="px-6 py-4 text-left">
                Medicine
              </th>

              <th className="px-6 py-4 text-left">
                Code
              </th>

              <th className="px-6 py-4 text-left">
                Quantity
              </th>

              <th className="px-6 py-4 text-left">
                Date
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-left">
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {filteredIndents.length === 0 ? (

              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No indents found
                </td>
              </tr>

            ) : (

              filteredIndents.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {item.medicine}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.code}
                  </td>

                  <td className="px-6 py-4 font-bold text-gray-800">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.date}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      {item.status === "Pending" && (
                        <button
                          onClick={() =>
                            submitIndent(item.id)
                          }
                          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Submit
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteIndent(item.id)
                        }
                        className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </main>
  );
}