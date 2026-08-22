"use client";

import { useState } from "react";

type ScannedMedicine = {
  id: number;
  name: string;
  code: string;
  batch: string;
  quantity: number;
  expiry: string;
};

export default function BillOCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [medicines, setMedicines] = useState<ScannedMedicine[]>([]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setScanned(false);
    setMedicines([]);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const scanBill = () => {
    if (!selectedFile) {
      alert("Please upload a medicine bill first.");
      return;
    }

    setScanning(true);

    setTimeout(() => {
      setMedicines([
        {
          id: 1,
          name: "Paracetamol 500mg",
          code: "PCM001",
          batch: "PCM2026A",
          quantity: 50,
          expiry: "2027-06-30",
        },
        {
          id: 2,
          name: "Amoxicillin 500mg",
          code: "AMX002",
          batch: "AMX2026B",
          quantity: 30,
          expiry: "2027-02-15",
        },
      ]);

      setScanning(false);
      setScanned(true);
    }, 1500);
  };

  const removeMedicine = (id: number) => {
    setMedicines((oldMedicines) =>
      oldMedicines.filter((medicine) => medicine.id !== id)
    );
  };

  const clearBill = () => {
    setSelectedFile(null);
    setPreview("");
    setScanned(false);
    setMedicines([]);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          🧾 Bill OCR
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Upload a medicine bill and scan the details
        </p>

      </div>

      {/* UPLOAD CARD */}

      <div className="rounded-xl bg-white p-6 shadow">

        <h2 className="text-xl font-bold text-gray-800">
          📷 Upload Medicine Bill
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Upload an image of the medicine bill
        </p>

        {/* FILE INPUT */}

        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-8 text-center hover:bg-emerald-100">

          <div className="text-5xl">
            📄
          </div>

          <p className="mt-3 font-semibold text-emerald-700">
            Click to upload bill
          </p>

          <p className="mt-1 text-xs text-gray-500">
            JPG, JPEG or PNG
          </p>

          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

        </label>

        {/* FILE NAME */}

        {selectedFile && (

          <div className="mt-4 rounded-lg bg-gray-50 p-4">

            <p className="text-sm font-semibold text-gray-800">
              Selected File
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {selectedFile.name}
            </p>

          </div>

        )}

        {/* PREVIEW */}

        {preview && (

          <div className="mt-6">

            <h3 className="mb-3 text-sm font-bold text-gray-800">
              Bill Preview
            </h3>

            <div className="flex justify-center rounded-xl border bg-gray-50 p-4">

              <img
                src={preview}
                alt="Bill preview"
                className="max-h-[450px] max-w-full rounded-lg object-contain shadow"
              />

            </div>

          </div>

        )}

        {/* BUTTONS */}

        {selectedFile && (

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              onClick={scanBill}
              disabled={scanning}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >

              {scanning
                ? "🔍 Scanning..."
                : "🔍 Scan Bill"}

            </button>

            <button
              onClick={clearBill}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Clear
            </button>

          </div>

        )}

      </div>

      {/* SCANNING */}

      {scanning && (

        <div className="mt-6 rounded-xl bg-blue-50 p-5">

          <p className="font-bold text-blue-700">
            🔍 Scanning bill...
          </p>

          <p className="mt-1 text-sm text-blue-600">
            Reading medicine names, batch numbers and quantities.
          </p>

        </div>

      )}

      {/* RESULTS */}

      {scanned && (

        <div className="mt-6 rounded-xl bg-white p-6 shadow">

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                ✅ Scan Results
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Medicines detected from the bill
              </p>

            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              {medicines.length} Medicines Found
            </span>

          </div>

          {/* TABLE */}

          <div className="mt-5 overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead className="bg-emerald-600 text-white">

                <tr>

                  <th className="px-4 py-3 text-left">
                    Medicine
                  </th>

                  <th className="px-4 py-3 text-left">
                    Code
                  </th>

                  <th className="px-4 py-3 text-left">
                    Batch
                  </th>

                  <th className="px-4 py-3 text-left">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-left">
                    Expiry
                  </th>

                  <th className="px-4 py-3 text-left">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {medicines.map((medicine) => (

                  <tr
                    key={medicine.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-4 py-4 font-semibold text-gray-800">
                      💊 {medicine.name}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {medicine.code}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {medicine.batch}
                    </td>

                    <td className="px-4 py-4 font-bold text-gray-800">
                      {medicine.quantity}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {medicine.expiry}
                    </td>

                    <td className="px-4 py-4">

                      <button
                        onClick={() =>
                          removeMedicine(medicine.id)
                        }
                        className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                      >
                        Remove
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* ADD BUTTON */}

          {medicines.length > 0 && (

            <div className="mt-6 flex justify-end">

              <button
                onClick={() =>
                  alert(
                    "Medicine details ready to add to stock."
                  )
                }
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                ➕ Add to Medicine Stock
              </button>

            </div>

          )}

        </div>

      )}

    </main>
  );
}