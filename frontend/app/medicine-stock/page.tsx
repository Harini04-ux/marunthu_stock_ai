"use client";

import { useEffect, useMemo, useState } from "react";

type Medicine = {
  id: number;
  name: string;
  batch: string;
  quantity: number;
  minimumStock: number;
  expiry: string;
};

type BackendMedicine = {
  id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  reorder_level: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://10.125.207.102:8001";

export default function Page() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [medicineName, setMedicineName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // =====================================================
  // GET MEDICINES
  // =====================================================

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Connecting to:",
        `${API_URL}/medicines`
      );

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
          `Backend returned ${response.status}`
        );
      }

      const data: BackendMedicine[] =
        await response.json();

      console.log("Medicines received:", data);

      const formattedData: Medicine[] = data.map(
        (item) => ({
          id: item.id,
          name: item.medicine_name,
          batch: item.batch_number,
          quantity: item.quantity,
          minimumStock: item.reorder_level,
          expiry: item.expiry_date,
        })
      );

      setMedicines(formattedData);
    } catch (err) {
      console.error(
        "Medicine fetch error:",
        err
      );

      setError(
        "Unable to connect to backend. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // =====================================================
  // STOCK STATUS
  // =====================================================

  const getStockStatus = (
    quantity: number,
    minimumStock: number
  ) => {
    if (quantity === 0) {
      return {
        text: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (quantity <= minimumStock) {
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

  // =====================================================
  // EXPIRY STATUS
  // =====================================================

  const getExpiryStatus = (
    expiry: string
  ) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(expiry);

    expiryDate.setHours(0, 0, 0, 0);

    const difference =
      expiryDate.getTime() -
      today.getTime();

    const daysLeft = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return {
        text: "Expired",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (daysLeft <= 30) {
      return {
        text: `Expires in ${daysLeft} days`,
        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      text: "Valid",
      className:
        "bg-green-100 text-green-700",
    };
  };

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredMedicines =
    useMemo(() => {
      return medicines.filter(
        (medicine) => {
          const searchText =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            medicine.name
              .toLowerCase()
              .includes(searchText) ||
            medicine.batch
              .toLowerCase()
              .includes(searchText);

          const stockStatus =
            getStockStatus(
              medicine.quantity,
              medicine.minimumStock
            ).text;

          const matchesStatus =
            statusFilter === "All" ||
            stockStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      medicines,
      search,
      statusFilter,
    ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalMedicines =
    medicines.length;

  const lowStockCount =
    medicines.filter(
      (medicine) =>
        medicine.quantity > 0 &&
        medicine.quantity <=
          medicine.minimumStock
    ).length;

  const outOfStockCount =
    medicines.filter(
      (medicine) =>
        medicine.quantity === 0
    ).length;

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {
    setMedicineName("");
    setBatchNumber("");
    setQuantity("");
    setMinimumStock("");
    setExpiryDate("");

    setEditingId(null);
    setEditMode(false);
  };

  // =====================================================
  // ADD MODAL
  // =====================================================

  const openAddModal = () => {
    clearForm();

    setEditMode(false);
    setShowModal(true);
  };

  // =====================================================
  // EDIT MODAL
  // =====================================================

  const openEditModal = (
    medicine: Medicine
  ) => {
    setMedicineName(medicine.name);
    setBatchNumber(medicine.batch);
    setQuantity(
      String(medicine.quantity)
    );
    setMinimumStock(
      String(medicine.minimumStock)
    );
    setExpiryDate(medicine.expiry);

    setEditingId(medicine.id);
    setEditMode(true);
    setShowModal(true);
  };

  // =====================================================
  // ADD MEDICINE
  // =====================================================

  const handleAddMedicine =
    async () => {
      if (
        !medicineName.trim() ||
        !batchNumber.trim() ||
        !quantity ||
        !minimumStock ||
        !expiryDate
      ) {
        alert(
          "Please fill all fields"
        );
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/medicines`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              body: JSON.stringify({
                medicine_name:
                  medicineName.trim(),
                batch_number:
                  batchNumber.trim(),
                quantity:
                  Number(quantity),
                expiry_date:
                  expiryDate,
                reorder_level:
                  Number(
                    minimumStock
                  ),
              }),
            }
          );

        const responseText =
          await response.text();

        console.log(
          "POST response:",
          responseText
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        alert(
          "Medicine added successfully!"
        );

        clearForm();
        setShowModal(false);

        await fetchMedicines();
      } catch (error) {
        console.error(
          "Add medicine error:",
          error
        );

        alert(
          "Unable to add medicine. Please check backend connection."
        );
      }
    };

  // =====================================================
  // EDIT MEDICINE
  // =====================================================

  const handleEditMedicine =
    async () => {
      if (editingId === null) {
        return;
      }

      if (
        !medicineName.trim() ||
        !batchNumber.trim() ||
        !quantity ||
        !minimumStock ||
        !expiryDate
      ) {
        alert(
          "Please fill all fields"
        );
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/medicines/${editingId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              body: JSON.stringify({
                medicine_name:
                  medicineName.trim(),
                batch_number:
                  batchNumber.trim(),
                quantity:
                  Number(quantity),
                expiry_date:
                  expiryDate,
                reorder_level:
                  Number(
                    minimumStock
                  ),
              }),
            }
          );

        const responseText =
          await response.text();

        console.log(
          "PUT response:",
          responseText
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        alert(
          "Medicine updated successfully!"
        );

        clearForm();
        setShowModal(false);

        await fetchMedicines();
      } catch (error) {
        console.error(
          "Edit medicine error:",
          error
        );

        alert(
          "Unable to update medicine. Please check backend."
        );
      }
    };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {
    if (editMode) {
      await handleEditMedicine();
    } else {
      await handleAddMedicine();
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    id: number
  ) => {
    const medicine =
      medicines.find(
        (item) => item.id === id
      );

    if (!medicine) {
      return;
    }

    const confirmDelete =
      window.confirm(
        `Delete ${medicine.name}?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/medicines/${id}`,
          {
            method: "DELETE",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const responseText =
        await response.text();

      console.log(
        "DELETE response:",
        responseText
      );

      if (!response.ok) {
        throw new Error(
          `Delete failed: ${response.status}`
        );
      }

      alert(
        `${medicine.name} deleted successfully!`
      );

      await fetchMedicines();
    } catch (error) {
      console.error(
        "Delete medicine error:",
        error
      );

      alert(
        "Unable to delete medicine. Please check backend."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <div className="text-4xl">
              ⏳
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Loading Medicines...
            </h2>

            <p className="mt-2 text-gray-500">
              Connecting to backend
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

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            💊 Medicine Stock
          </h1>

          <p className="mt-1 text-gray-500">
            Manage PHC medicine inventory
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          + Add Medicine
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

          <p className="font-semibold text-red-700">
            ❌ {error}
          </p>

          <p className="mt-1 text-sm text-red-600">
            Backend: {API_URL}
          </p>

          <button
            onClick={fetchMedicines}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Retry Connection
          </button>

        </div>
      )}

      {/* SUMMARY */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm font-semibold text-gray-500">
            Total Medicines
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {totalMedicines}
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-5 shadow">
          <p className="text-sm font-semibold text-orange-600">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-700">
            {lowStockCount}
          </p>
        </div>

        <div className="rounded-xl bg-red-50 p-5 shadow">
          <p className="text-sm font-semibold text-red-600">
            Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {outOfStockCount}
          </p>
        </div>

      </div>

      {/* SEARCH */}

      <div className="mt-6 rounded-xl bg-white p-4 shadow">

        <div className="flex flex-col gap-3 md:flex-row">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search medicine or batch..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
          >
            <option value="All">
              All Status
            </option>

            <option value="In Stock">
              In Stock
            </option>

            <option value="Low Stock">
              Low Stock
            </option>

            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">

        {filteredMedicines.length ===
        0 ? (
          <div className="p-10 text-center">

            <div className="text-5xl">
              🔎
            </div>

            <p className="mt-3 font-semibold text-gray-700">
              No medicines found
            </p>

          </div>
        ) : (
          <table className="w-full min-w-[1100px]">

            <thead className="bg-emerald-600 text-white">

              <tr>

                <th className="px-5 py-4 text-left">
                  Medicine
                </th>

                <th className="px-5 py-4 text-left">
                  Batch
                </th>

                <th className="px-5 py-4 text-left">
                  Quantity
                </th>

                <th className="px-5 py-4 text-left">
                  Minimum
                </th>

                <th className="px-5 py-4 text-left">
                  Stock Status
                </th>

                <th className="px-5 py-4 text-left">
                  Expiry Date
                </th>

                <th className="px-5 py-4 text-left">
                  Expiry Status
                </th>

                <th className="px-5 py-4 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredMedicines.map(
                (medicine) => {

                  const stockStatus =
                    getStockStatus(
                      medicine.quantity,
                      medicine.minimumStock
                    );

                  const expiryStatus =
                    getExpiryStatus(
                      medicine.expiry
                    );

                  return (
                    <tr
                      key={medicine.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-gray-800">
                          💊 {medicine.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          ID: {medicine.id}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {medicine.batch}
                      </td>

                      <td className="px-5 py-4">

                        <span className="font-bold text-gray-800">
                          {medicine.quantity}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {medicine.minimumStock}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${stockStatus.className}`}
                        >
                          {stockStatus.text}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {medicine.expiry}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${expiryStatus.className}`}
                        >
                          {expiryStatus.text}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                medicine
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                medicine.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>
        )}

      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-5">

              <h2 className="text-xl font-bold text-gray-800">
                {editMode
                  ? "✏️ Edit Medicine"
                  : "➕ Add Medicine"}
              </h2>

              <button
                onClick={() => {
                  clearForm();
                  setShowModal(false);
                }}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>

            </div>

            <div className="space-y-4 p-6">

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Medicine Name
                </label>

                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) =>
                    setMedicineName(
                      e.target.value
                    )
                  }
                  placeholder="Example: Paracetamol"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Batch Number
                </label>

                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) =>
                    setBatchNumber(
                      e.target.value
                    )
                  }
                  placeholder="Example: PCM001"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  placeholder="Example: 100"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Reorder Level
                </label>

                <input
                  type="number"
                  min="0"
                  value={minimumStock}
                  onChange={(e) =>
                    setMinimumStock(
                      e.target.value
                    )
                  }
                  placeholder="Example: 20"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Expiry Date
                </label>

                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) =>
                    setExpiryDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">

                <button
                  onClick={() => {
                    clearForm();
                    setShowModal(false);
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  {editMode
                    ? "Update Medicine"
                    : "Save Medicine"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}