"use client";

import { useState } from "react";

type Medicine = {
  id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  reorder_level: number;
};

type OCRResponse = {
  success: boolean;
  message: string;
  medicine?: Medicine;
  extracted_text?: string;
};

export default function BillOCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || " http://10.125.207.102:8001";

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a bill image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();

      // IMPORTANT:
      // Change "file" only if your FastAPI endpoint uses another parameter name.
      formData.append("file", file);

      const response = await fetch(`${API_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: OCRResponse = await response.json();

      console.log("OCR Response:", data);

      if (!data.success) {
        throw new Error(data.message || "OCR failed");
      }

      setResult(data);
    } catch (err) {
      console.error("OCR error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to OCR backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          🧾 Bill OCR
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Upload a medicine bill and automatically extract medicine details
        </p>
      </div>

      {/* UPLOAD CARD */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow">

        <h2 className="text-xl font-bold text-gray-800">
          Upload Medicine Bill
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Supported bill images can be uploaded for OCR processing.
        </p>

        <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">

          <div className="text-5xl">
            📄
          </div>

          <p className="mt-3 font-semibold text-gray-700">
            Select your medicine bill
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Upload an image of the bill
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              setError("");
              setResult(null);
            }}
            className="mx-auto mt-5 block w-full max-w-md rounded-lg border border-gray-300 bg-white p-3 text-sm"
          />

          {file && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              Selected file:
              <span className="ml-1 font-semibold">
                {file.name}
              </span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "⏳ Processing..." : "🤖 Extract Medicine"}
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">

          <h3 className="font-bold text-red-700">
            ❌ OCR Error
          </h3>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

        </div>
      )}

      {/* SUCCESS */}

      {result?.success && result.medicine && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow">

          <div className="flex items-center gap-3">

            <div className="text-3xl">
              ✅
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Medicine Extracted
              </h2>

              <p className="text-sm text-green-600">
                {result.message}
              </p>
            </div>

          </div>

          {/* MEDICINE DETAILS */}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500">
                Medicine Name
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {result.medicine.medicine_name}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500">
                Batch Number
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {result.medicine.batch_number}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500">
                Quantity
              </p>

              <p className="mt-1 font-bold text-blue-600">
                {result.medicine.quantity}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500">
                Expiry Date
              </p>

              <p className="mt-1 font-bold text-orange-600">
                {result.medicine.expiry_date}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500">
                Reorder Level
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {result.medicine.reorder_level}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* EXTRACTED TEXT */}

      {result?.extracted_text && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow">

          <h2 className="text-xl font-bold text-gray-800">
            📝 Extracted OCR Text
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Raw text detected from the uploaded bill
          </p>

          <div className="mt-4 max-h-80 overflow-auto rounded-lg bg-gray-900 p-5">

            <pre className="whitespace-pre-wrap text-sm text-green-300">
              {result.extracted_text}
            </pre>

          </div>

        </div>
      )}

      {/* INFO */}

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

        <h2 className="font-bold text-blue-800">
          🤖 AI + OCR
        </h2>

        <p className="mt-2 text-sm text-blue-700">
          The uploaded medicine bill is processed by the backend OCR
          system. Extracted information is then returned to the frontend
          and displayed here.
        </p>

      </div>

    </main>
  );
}