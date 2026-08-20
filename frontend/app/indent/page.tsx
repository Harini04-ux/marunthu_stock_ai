"use client";

import { useEffect, useState } from "react";

type Medicine = {
  id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  reorder_level: number;
};

type Indent = {
  id?: number;
  indent_number?: string;
  medicine_id: number;
  medicine_name?: string;
  requested_quantity: number;
  current_stock: number;
  predicted_quantity: number;
  priority: "High" | "Medium" | "Low";
  reason: string;
  status?: "Pending" | "Approved" | "Rejected";
  requested_date?: string;
  approved_date?: string | null;
};

const API_URL = " http://10.125.207.102:8001";

export default function IndentPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [indents, setIndents] = useState<Indent[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [medicineId, setMedicineId] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [predictedQuantity, setPredictedQuantity] = useState("");

  const [priority, setPriority] =
    useState<"High" | "Medium" | "Low">("Medium");

  const [reason, setReason] = useState("");

  // =========================================================
  // GET MEDICINES
  // =========================================================

  const fetchMedicines = async () => {
    try {
      const response = await fetch(
        `${API_URL}/medicines`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Medicine fetch failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Medicine backend response:",
        data
      );

      if (Array.isArray(data)) {
        setMedicines(data);
      } else if (
        Array.isArray(data?.medicines)
      ) {
        setMedicines(data.medicines);
      } else if (
        Array.isArray(data?.data)
      ) {
        setMedicines(data.data);
      } else {
        setMedicines([]);

        setError(
          "Backend returned invalid medicine data."
        );
      }
    } catch (error) {
      console.error(
        "Medicine fetch error:",
        error
      );

      setMedicines([]);

      setError(
        "Unable to load medicines from backend."
      );
    }
  };

  // =========================================================
  // GET INDENTS
  // =========================================================

  const fetchIndents = async () => {
    try {
      const response = await fetch(
        `${API_URL}/indents`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Indent fetch failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Indent backend response:",
        data
      );

      // Backend:
      // {
      //   total_indents: 2,
      //   indents: [...]
      // }

      if (Array.isArray(data)) {
        setIndents(data);
      } else if (
        Array.isArray(data?.indents)
      ) {
        setIndents(data.indents);
      } else if (
        Array.isArray(data?.data)
      ) {
        setIndents(data.data);
      } else {
        setIndents([]);

        setError(
          "Backend returned invalid indent data."
        );
      }
    } catch (error) {
      console.error(
        "Indent fetch error:",
        error
      );

      setIndents([]);

      setError(
        "Unable to load indents from backend."
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      setError("");

      await Promise.all([
        fetchMedicines(),
        fetchIndents(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =========================================================
  // SELECTED MEDICINE
  // =========================================================

  const selectedMedicine =
    medicines.find(
      (medicine) =>
        medicine.id === Number(medicineId)
    );

  // =========================================================
  // AUTO PREDICT
  // =========================================================

  const handleMedicineChange = async (
    value: string
  ) => {
    setMedicineId(value);

    setPredictedQuantity("");

    const medicine = medicines.find(
      (item) =>
        item.id === Number(value)
    );

    if (!medicine) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/prediction/${medicine.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.log(
          "Prediction endpoint failed"
        );

        return;
      }

      const data = await response.json();

      console.log(
        "Prediction response:",
        data
      );

      if (
        data?.predicted_30_day_demand !==
        undefined
      ) {
        setPredictedQuantity(
          String(
            data.predicted_30_day_demand
          )
        );
      }
    } catch (error) {
      console.error(
        "Prediction error:",
        error
      );
    }
  };

  // =========================================================
  // CREATE INDENT
  // =========================================================

  const handleAddIndent = async () => {
    setError("");
    setSuccess("");

    if (!medicineId) {
      alert("Please select a medicine.");
      return;
    }

    if (!requestedQuantity) {
      alert(
        "Please enter requested quantity."
      );
      return;
    }

    if (
      Number(requestedQuantity) <= 0
    ) {
      alert(
        "Requested quantity must be greater than 0."
      );
      return;
    }

    if (!predictedQuantity) {
      alert(
        "Please enter predicted quantity."
      );
      return;
    }

    if (!reason.trim()) {
      alert("Please enter reason.");
      return;
    }

    if (!selectedMedicine) {
      alert(
        "Selected medicine not found."
      );
      return;
    }

    try {
      setSaving(true);

      const indentData = {
        medicine_id: Number(
          medicineId
        ),

        requested_quantity: Number(
          requestedQuantity
        ),

        current_stock:
          selectedMedicine.quantity,

        predicted_quantity: Number(
          predictedQuantity
        ),

        priority: priority,

        reason: reason.trim(),
      };

      console.log(
        "Sending indent:",
        indentData
      );

      const response = await fetch(
        `${API_URL}/indents`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify(
            indentData
          ),
        }
      );

      const data =
        await response.json();

      console.log(
        "Create indent response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Indent creation failed: ${response.status}`
        );
      }

      if (
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            "Indent creation failed"
        );
      }

      setSuccess(
        "✅ Indent created successfully!"
      );

      // Clear form

      setMedicineId("");

      setRequestedQuantity("");

      setPredictedQuantity("");

      setPriority("Medium");

      setReason("");

      // Refresh indent list

      await fetchIndents();
    } catch (error) {
      console.error(
        "Indent creation error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create indent."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    await Promise.all([
      fetchMedicines(),
      fetchIndents(),
    ]);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="rounded-xl bg-white p-8 text-center shadow">

            <div className="text-5xl">
              ⏳
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Loading Indent...
            </h2>

            <p className="mt-2 text-gray-500">
              Connecting to Marunthu Stock AI backend
            </p>

          </div>

        </div>

      </main>
    );
  }

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  const totalIndents =
    indents.length;

  const pendingIndents =
    indents.filter(
      (indent) =>
        indent.status === "Pending"
    ).length;

  const approvedIndents =
    indents.filter(
      (indent) =>
        indent.status === "Approved"
    ).length;

  const rejectedIndents =
    indents.filter(
      (indent) =>
        indent.status === "Rejected"
    ).length;

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            📄 Medicine Indent
          </h1>

          <p className="mt-1 text-gray-500">
            Create and manage medicine stock requests
          </p>

        </div>

        <button
          onClick={handleRefresh}
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          🔄 Refresh
        </button>

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {success && (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">

          <p className="font-semibold text-green-700">
            {success}
          </p>

        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

          <p className="font-semibold text-red-700">
            ❌ {error}
          </p>

          <p className="mt-1 text-sm text-red-600">
            Backend: {API_URL}
          </p>

        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm font-semibold text-gray-500">
            📋 Total Indents
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {totalIndents}
          </p>

        </div>

        {/* PENDING */}

        <div className="rounded-xl border-l-4 border-orange-500 bg-white p-5 shadow">

          <p className="text-sm font-semibold text-gray-500">
            🟠 Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {pendingIndents}
          </p>

        </div>

        {/* APPROVED */}

        <div className="rounded-xl border-l-4 border-green-500 bg-white p-5 shadow">

          <p className="text-sm font-semibold text-gray-500">
            🟢 Approved
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {approvedIndents}
          </p>

        </div>

        {/* REJECTED */}

        <div className="rounded-xl border-l-4 border-red-500 bg-white p-5 shadow">

          <p className="text-sm font-semibold text-gray-500">
            🔴 Rejected
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {rejectedIndents}
          </p>

        </div>

      </div>

      {/* =====================================================
          CREATE INDENT
      ====================================================== */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow">

        <h2 className="text-xl font-bold text-gray-800">
          ➕ Create New Indent
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Request medicine based on current stock and predicted demand.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* MEDICINE */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Medicine
            </label>

            <select
              value={medicineId}
              onChange={(e) =>
                handleMedicineChange(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
            >

              <option value="">
                Select Medicine
              </option>

              {Array.isArray(
                medicines
              ) &&
                medicines.map(
                  (medicine) => (
                    <option
                      key={medicine.id}
                      value={medicine.id}
                    >
                      {medicine.medicine_name}
                      {" - "}
                      Stock:{" "}
                      {medicine.quantity}
                    </option>
                  )
                )}

            </select>

          </div>

          {/* CURRENT STOCK */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Current Stock
            </label>

            <input
              type="number"
              value={
                selectedMedicine
                  ? selectedMedicine.quantity
                  : ""
              }
              readOnly
              placeholder="Auto filled"
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-700"
            />

          </div>

          {/* REQUESTED QUANTITY */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Requested Quantity
            </label>

            <input
              type="number"
              min="1"
              value={
                requestedQuantity
              }
              onChange={(e) =>
                setRequestedQuantity(
                  e.target.value
                )
              }
              placeholder="Example: 100"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
            />

          </div>

          {/* PREDICTED QUANTITY */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              AI Predicted Demand
            </label>

            <input
              type="number"
              min="0"
              value={
                predictedQuantity
              }
              onChange={(e) =>
                setPredictedQuantity(
                  e.target.value
                )
              }
              placeholder="AI prediction"
              className="w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-blue-900 outline-none focus:border-blue-500"
            />

            {medicineId &&
              predictedQuantity && (
                <p className="mt-1 text-xs text-blue-600">
                  🤖 Automatically fetched from AI prediction
                </p>
              )}

          </div>

          {/* PRIORITY */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value as
                    | "High"
                    | "Medium"
                    | "Low"
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
            >

              <option value="High">
                🔴 High
              </option>

              <option value="Medium">
                🟡 Medium
              </option>

              <option value="Low">
                🟢 Low
              </option>

            </select>

          </div>

          {/* REASON */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Reason
            </label>

            <input
              type="text"
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
              placeholder="Example: Low stock and high demand"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
            />

          </div>

        </div>

        {/* SUBMIT */}

        <div className="mt-6 flex justify-end">

          <button
            onClick={
              handleAddIndent
            }
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >

            {saving
              ? "Saving..."
              : "📄 Create Indent"}

          </button>

        </div>

      </div>

      {/* =====================================================
          INDENT LIST
      ====================================================== */}

      <div className="mt-6 rounded-xl bg-white shadow">

        <div className="border-b p-5">

          <h2 className="text-xl font-bold text-gray-800">
            📋 Indent Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Previously created medicine requests
          </p>

        </div>

        {indents.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-5xl">
              📄
            </div>

            <p className="mt-3 font-semibold text-gray-700">
              No indents found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Create your first medicine indent above.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead className="bg-emerald-600 text-white">

                <tr>

                  <th className="px-5 py-4 text-left">
                    Indent No
                  </th>

                  <th className="px-5 py-4 text-left">
                    Medicine
                  </th>

                  <th className="px-5 py-4 text-left">
                    Current Stock
                  </th>

                  <th className="px-5 py-4 text-left">
                    Requested
                  </th>

                  <th className="px-5 py-4 text-left">
                    Predicted
                  </th>

                  <th className="px-5 py-4 text-left">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-left">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left">
                    Reason
                  </th>

                </tr>

              </thead>

              <tbody>

                {Array.isArray(
                  indents
                ) &&
                  indents.map(
                    (
                      indent,
                      index
                    ) => (

                      <tr
                        key={
                          indent.id ??
                          `${indent.medicine_id}-${index}`
                        }
                        className="border-b hover:bg-gray-50"
                      >

                        {/* INDENT NUMBER */}

                        <td className="px-5 py-4">

                          <span className="font-bold text-emerald-700">
                            {indent.indent_number ||
                              `IND-${indent.id}`}
                          </span>

                          {indent.requested_date && (
                            <p className="mt-1 text-xs text-gray-500">
                              {
                                indent.requested_date
                              }
                            </p>
                          )}

                        </td>

                        {/* MEDICINE */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-gray-800">
                            💊{" "}
                            {indent.medicine_name ||
                              "Unknown Medicine"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Medicine ID:{" "}
                            {
                              indent.medicine_id
                            }
                          </p>

                        </td>

                        {/* CURRENT STOCK */}

                        <td className="px-5 py-4">

                          <span
                            className={`font-bold ${
                              indent.current_stock <=
                              10
                                ? "text-red-600"
                                : "text-gray-800"
                            }`}
                          >
                            {
                              indent.current_stock
                            }
                          </span>

                        </td>

                        {/* REQUESTED */}

                        <td className="px-5 py-4 font-bold text-gray-800">
                          {
                            indent.requested_quantity
                          }
                        </td>

                        {/* PREDICTED */}

                        <td className="px-5 py-4">

                          <span className="font-bold text-blue-600">
                            {
                              indent.predicted_quantity
                            }
                          </span>

                        </td>

                        {/* PRIORITY */}

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              indent.priority ===
                              "High"
                                ? "bg-red-100 text-red-700"
                                : indent.priority ===
                                  "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {indent.priority ===
                            "High"
                              ? "🔴 High"
                              : indent.priority ===
                                "Medium"
                              ? "🟡 Medium"
                              : "🟢 Low"}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              indent.status ===
                              "Approved"
                                ? "bg-green-100 text-green-700"
                                : indent.status ===
                                  "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {indent.status ===
                            "Approved"
                              ? "✅ Approved"
                              : indent.status ===
                                "Rejected"
                              ? "❌ Rejected"
                              : "⏳ Pending"}
                          </span>

                        </td>

                        {/* REASON */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {indent.reason ||
                            "-"}
                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          INFO
      ====================================================== */}

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

        <div className="flex gap-3">

          <div className="text-2xl">
            🤖
          </div>

          <div>

            <h3 className="font-bold text-blue-800">
              AI + Indent Integration
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              Select a medicine to automatically
              fetch its predicted 30-day demand
              from the Marunthu Stock AI backend.
              You can then create an indent based
              on the predicted demand and current
              stock.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
