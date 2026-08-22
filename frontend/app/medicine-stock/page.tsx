"use client";

import { useMemo, useState } from "react";

type Medicine = {
  id: number;
  name: string;
  code: string;
  batch: string;
  category: string;
  quantity: number;
  minimumStock: number;
  expiry: string;
};

type SortOption =
  | "name-asc"
  | "name-desc"
  | "quantity-low"
  | "quantity-high"
  | "expiry-near"
  | "expiry-far";

export default function Page() {
  // ================= FORM =================

  const [showAddMedicine, setShowAddMedicine] =
    useState(false);

  const [medicineName, setMedicineName] = useState("");
  const [medicineCode, setMedicineCode] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // ================= SEARCH / SORT =================

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("name-asc");

  // ================= PAGINATION =================

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // ================= MEDICINES =================

  const [medicines, setMedicines] =
    useState<Medicine[]>([
      {
        id: 1,
        name: "Paracetamol 500mg",
        code: "PCM001",
        batch: "PCM2026A",
        category: "Tablet",
        quantity: 100,
        minimumStock: 20,
        expiry: "2027-06-30",
      },
      {
        id: 2,
        name: "Amoxicillin 500mg",
        code: "AMX002",
        batch: "AMX2026B",
        category: "Capsule",
        quantity: 15,
        minimumStock: 20,
        expiry: "2027-02-15",
      },
      {
        id: 3,
        name: "ORS Sachets",
        code: "ORS003",
        batch: "ORS2026C",
        category: "Sachet",
        quantity: 8,
        minimumStock: 20,
        expiry: "2026-09-10",
      },
      {
        id: 4,
        name: "Cetirizine 10mg",
        code: "CTZ004",
        batch: "CTZ2026D",
        category: "Tablet",
        quantity: 0,
        minimumStock: 20,
        expiry: "2027-04-20",
      },
      {
        id: 5,
        name: "Omeprazole 20mg",
        code: "OMP005",
        batch: "OMP2026E",
        category: "Capsule",
        quantity: 75,
        minimumStock: 20,
        expiry: "2028-01-10",
      },
      {
        id: 6,
        name: "Azithromycin 250mg",
        code: "AZM006",
        batch: "AZM2026F",
        category: "Tablet",
        quantity: 45,
        minimumStock: 15,
        expiry: "2027-08-15",
      },
      {
        id: 7,
        name: "Cough Syrup",
        code: "CS007",
        batch: "CS2026G",
        category: "Syrup",
        quantity: 12,
        minimumStock: 20,
        expiry: "2027-01-25",
      },
      {
        id: 8,
        name: "Vitamin D Drops",
        code: "VD008",
        batch: "VD2026H",
        category: "Drops",
        quantity: 30,
        minimumStock: 10,
        expiry: "2028-03-12",
      },
      {
        id: 9,
        name: "Insulin Injection",
        code: "INS009",
        batch: "INS2026I",
        category: "Injection",
        quantity: 5,
        minimumStock: 10,
        expiry: "2026-12-20",
      },
      {
        id: 10,
        name: "Antiseptic Cream",
        code: "ASC010",
        batch: "ASC2026J",
        category: "Cream",
        quantity: 60,
        minimumStock: 15,
        expiry: "2028-05-18",
      },
    ]);

  // ================= EDIT / DELETE =================

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [deletedMedicine, setDeletedMedicine] =
    useState<Medicine | null>(null);

  const [showUndo, setShowUndo] = useState(false);

  // ================= STOCK STATUS =================

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

  // ================= EXPIRY STATUS =================

  const getExpiryStatus = (
    expiry: string
  ) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const expiryDateObj =
      new Date(expiry);

    expiryDateObj.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      expiryDateObj.getTime() -
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

    if (daysLeft === 0) {
      return {
        text: "Expires Today",
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

  // ================= SUMMARY =================

  const inStockCount =
    medicines.filter(
      (medicine) =>
        medicine.quantity >
        medicine.minimumStock
    ).length;

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

  // ================= FILTER + SORT =================

  const filteredMedicines =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      let result =
        medicines.filter(
          (medicine) =>
            medicine.name
              .toLowerCase()
              .includes(searchText) ||
            medicine.code
              .toLowerCase()
              .includes(searchText) ||
            medicine.batch
              .toLowerCase()
              .includes(searchText) ||
            medicine.category
              .toLowerCase()
              .includes(searchText)
        );

      result.sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(
              b.name
            );

          case "name-desc":
            return b.name.localeCompare(
              a.name
            );

          case "quantity-low":
            return (
              a.quantity - b.quantity
            );

          case "quantity-high":
            return (
              b.quantity - a.quantity
            );

          case "expiry-near":
            return (
              new Date(
                a.expiry
              ).getTime() -
              new Date(
                b.expiry
              ).getTime()
            );

          case "expiry-far":
            return (
              new Date(
                b.expiry
              ).getTime() -
              new Date(
                a.expiry
              ).getTime()
            );

          default:
            return 0;
        }
      });

      return result;
    }, [medicines, search, sortBy]);

  // ================= PAGINATION =================

  const totalPages = Math.ceil(
    filteredMedicines.length /
      itemsPerPage
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      Math.max(totalPages, 1)
    );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const paginatedMedicines =
    filteredMedicines.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // ================= SEARCH CHANGE =================

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ================= SORT CHANGE =================

  const handleSort = (
    value: SortOption
  ) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // ================= SAVE =================

  const saveMedicine = () => {
    if (
      medicineName.trim() === "" ||
      medicineCode.trim() === "" ||
      batchNumber.trim() === "" ||
      category.trim() === "" ||
      quantity === "" ||
      minimumStock === "" ||
      expiryDate === ""
    ) {
      alert(
        "Please fill all medicine details"
      );
      return;
    }

    const numericQuantity =
      Number(quantity);

    const numericMinimumStock =
      Number(minimumStock);

    if (
      isNaN(numericQuantity) ||
      numericQuantity < 0
    ) {
      alert(
        "Please enter a valid quantity"
      );
      return;
    }

    if (
      isNaN(numericMinimumStock) ||
      numericMinimumStock < 0
    ) {
      alert(
        "Please enter a valid minimum stock"
      );
      return;
    }

    if (editingId !== null) {
      setMedicines(
        (oldMedicines) =>
          oldMedicines.map(
            (medicine) =>
              medicine.id === editingId
                ? {
                    ...medicine,
                    name: medicineName,
                    code: medicineCode,
                    batch: batchNumber,
                    category,
                    quantity:
                      numericQuantity,
                    minimumStock:
                      numericMinimumStock,
                    expiry: expiryDate,
                  }
                : medicine
          )
      );

      alert(
        "Medicine updated successfully!"
      );
    } else {
      const newMedicine: Medicine = {
        id: Date.now(),
        name: medicineName,
        code: medicineCode,
        batch: batchNumber,
        category,
        quantity:
          numericQuantity,
        minimumStock:
          numericMinimumStock,
        expiry: expiryDate,
      };

      setMedicines(
        (oldMedicines) => [
          ...oldMedicines,
          newMedicine,
        ]
      );

      alert(
        "Medicine added successfully!"
      );
    }

    clearForm();
    setShowAddMedicine(false);
  };

  // ================= EDIT =================

  const editMedicine = (
    medicine: Medicine
  ) => {
    setEditingId(medicine.id);

    setMedicineName(medicine.name);
    setMedicineCode(medicine.code);
    setBatchNumber(medicine.batch);
    setCategory(medicine.category);
    setQuantity(
      String(medicine.quantity)
    );
    setMinimumStock(
      String(
        medicine.minimumStock
      )
    );
    setExpiryDate(medicine.expiry);

    setShowAddMedicine(true);
  };

  // ================= DELETE =================

  const deleteMedicine = (
    id: number
  ) => {
    const medicine =
      medicines.find(
        (item) => item.id === id
      );

    if (!medicine) return;

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${medicine.name}?`
      );

    if (!confirmed) return;

    setMedicines(
      (oldMedicines) =>
        oldMedicines.filter(
          (item) =>
            item.id !== id
        )
    );

    setDeletedMedicine(medicine);
    setShowUndo(true);

    setTimeout(() => {
      setShowUndo(false);
      setDeletedMedicine(null);
    }, 5000);
  };

  // ================= UNDO =================

  const undoDelete = () => {
    if (!deletedMedicine) return;

    setMedicines(
      (oldMedicines) => [
        ...oldMedicines,
        deletedMedicine,
      ]
    );

    setDeletedMedicine(null);
    setShowUndo(false);
  };

  // ================= CLEAR FORM =================

  const clearForm = () => {
    setMedicineName("");
    setMedicineCode("");
    setBatchNumber("");
    setCategory("");
    setQuantity("");
    setMinimumStock("");
    setExpiryDate("");
    setEditingId(null);
  };

  // ================= OPEN ADD =================

  const openAddMedicine = () => {
    clearForm();
    setShowAddMedicine(true);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            💊 Medicine Stock
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your medicine stock
          </p>
        </div>

        <button
          onClick={openAddMedicine}
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          + Add Medicine
        </button>

      </div>

      {/* ================= SEARCH + SORT ================= */}

      <div className="mt-6 rounded-xl bg-white p-4 shadow">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <span className="absolute left-4 top-3.5 text-gray-400">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                handleSearch(
                  e.target.value
                )
              }
              placeholder="Search medicine name, code, batch or category..."
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-500 outline-none focus:border-emerald-500"
            />

          </div>

          {/* SORT */}

          <select
            value={sortBy}
            onChange={(e) =>
              handleSort(
                e.target
                  .value as SortOption
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-emerald-500 md:w-64"
          >

            <option value="name-asc">
              Sort: Name A → Z
            </option>

            <option value="name-desc">
              Sort: Name Z → A
            </option>

            <option value="quantity-low">
              Sort: Quantity Low → High
            </option>

            <option value="quantity-high">
              Sort: Quantity High → Low
            </option>

            <option value="expiry-near">
              Sort: Expiry Nearest
            </option>

            <option value="expiry-far">
              Sort: Expiry Latest
            </option>

          </select>

        </div>

        {/* RESULT COUNT */}

        <div className="mt-3 flex items-center justify-between">

          <p className="text-sm text-gray-500">

            {filteredMedicines.length === 0
              ? "No results"
              : `Showing ${startIndex + 1}-${Math.min(
                  startIndex +
                    itemsPerPage,
                  filteredMedicines.length
                )} of ${filteredMedicines.length} medicines`}

          </p>

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="text-sm font-semibold text-emerald-600 hover:underline"
            >
              Clear Search
            </button>
          )}

        </div>

      </div>

      {/* ================= STOCK SUMMARY ================= */}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-green-50 p-5">
          <p className="text-sm font-semibold text-green-700">
            🟢 In Stock
          </p>

          <p className="mt-1 text-3xl font-bold text-green-700">
            {inStockCount}
          </p>

          <p className="mt-1 text-xs text-green-600">
            Above minimum level
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-5">
          <p className="text-sm font-semibold text-orange-700">
            🟠 Low Stock
          </p>

          <p className="mt-1 text-3xl font-bold text-orange-700">
            {lowStockCount}
          </p>

          <p className="mt-1 text-xs text-orange-600">
            Need restocking
          </p>
        </div>

        <div className="rounded-xl bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            🔴 Out of Stock
          </p>

          <p className="mt-1 text-3xl font-bold text-red-700">
            {outOfStockCount}
          </p>

          <p className="mt-1 text-xs text-red-600">
            Stock completely empty
          </p>
        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">

        {filteredMedicines.length === 0 ? (

          /* ================= NO RESULTS ================= */

          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

            <div className="text-6xl">
              🔎
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No medicines found
            </h2>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              We couldn't find any medicine matching
              <span className="font-semibold text-gray-700">
                {" "}
                "{search}"
              </span>.
              Try another medicine name, code, batch
              or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="mt-5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Clear Search
            </button>

          </div>

        ) : (

          <table className="w-full min-w-[1350px]">

            <thead className="bg-emerald-600 text-white">

              <tr>

                <th className="px-5 py-4 text-left">
                  Medicine
                </th>

                <th className="px-5 py-4 text-left">
                  Code
                </th>

                <th className="px-5 py-4 text-left">
                  Batch
                </th>

                <th className="px-5 py-4 text-left">
                  Category
                </th>

                <th className="px-5 py-4 text-left">
                  Quantity
                </th>

                <th className="px-5 py-4 text-left">
                  Minimum
                </th>

                <th className="px-5 py-4 text-left">
                  Status
                </th>

                <th className="px-5 py-4 text-left">
                  Expiry
                </th>

                <th className="px-5 py-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedMedicines.map(
                (medicine) => {

                  const status =
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

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        💊 {medicine.name}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {medicine.code}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {medicine.batch}
                      </td>

                      <td className="px-5 py-4">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          {medicine.category}
                        </span>

                      </td>

                      <td className="px-5 py-4 font-bold text-gray-800">
                        {medicine.quantity}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-700">
                        {medicine.minimumStock}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.text}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-sm text-gray-700">
                          {medicine.expiry}
                        </p>

                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-bold ${expiryStatus.className}`}
                        >
                          {expiryStatus.text}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              editMedicine(
                                medicine
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteMedicine(
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

      {/* ================= PAGINATION ================= */}

      {filteredMedicines.length > 0 &&
        totalPages > 1 && (

          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl bg-white p-4 shadow sm:flex-row">

            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-bold text-gray-800">
                {safeCurrentPage}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={
                  safeCurrentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        page - 1,
                        1
                      )
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
              >
                ← Previous
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    safeCurrentPage === page
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>

              ))}

              <button
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        page + 1,
                        totalPages
                      )
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
              >
                Next →
              </button>

            </div>

          </div>
        )}

      {/* ================= ADD / EDIT POPUP ================= */}

      {showAddMedicine && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  {editingId !== null
                    ? "✏️ Edit Medicine"
                    : "➕ Add Medicine"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter medicine details
                </p>

              </div>

              <button
                onClick={() => {
                  clearForm();
                  setShowAddMedicine(false);
                }}
                className="rounded-full px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>

            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">

              {/* NAME */}

              <label className="mb-2 block text-sm font-semibold text-gray-800">
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
                placeholder="Enter medicine name"
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
              />

              {/* CODE */}

              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Medicine Code
              </label>

              <input
                type="text"
                value={medicineCode}
                onChange={(e) =>
                  setMedicineCode(
                    e.target.value
                  )
                }
                placeholder="Enter medicine code"
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
              />

              {/* BATCH */}

              <label className="mb-2 block text-sm font-semibold text-gray-800">
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
                placeholder="Enter batch number"
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
              />

              {/* CATEGORY */}

              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
              >

                <option value="">
                  Select category
                </option>

                <option value="Tablet">
                  Tablet
                </option>

                <option value="Capsule">
                  Capsule
                </option>

                <option value="Syrup">
                  Syrup
                </option>

                <option value="Injection">
                  Injection
                </option>

                <option value="Sachet">
                  Sachet
                </option>

                <option value="Drops">
                  Drops
                </option>

                <option value="Cream">
                  Cream
                </option>

                <option value="Ointment">
                  Ointment
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

              {/* QUANTITY */}

              <label className="mb-2 block text-sm font-semibold text-gray-800">
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
                placeholder="Enter quantity"
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
              />

              {/* MINIMUM */}

              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Minimum Stock
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
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-emerald-500"
              />

              {/* EXPIRY */}

              <label className="mb-2 block text-sm font-semibold text-gray-800">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none"
              />

              {/* BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={() => {
                    clearForm();
                    setShowAddMedicine(false);
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={saveMedicine}
                  className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  {editingId !== null
                    ? "Update Medicine"
                    : "Save Medicine"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ================= UNDO ================= */}

      {showUndo &&
        deletedMedicine && (

          <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-5 rounded-xl bg-gray-900 px-5 py-4 text-white shadow-xl">

            <div>

              <p className="font-bold">
                Medicine deleted
              </p>

              <p className="text-sm text-gray-300">
                {deletedMedicine.name}
              </p>

            </div>

            <button
              onClick={undoDelete}
              className="rounded-lg bg-white px-5 py-2 font-bold text-gray-900 hover:bg-gray-200"
            >
              Undo
            </button>

          </div>
        )}

    </main>
  );
}