"use client";

import { useRef, useState } from "react";

const API_URL = "http://10.125.207.102:8000";

export default function VoicePage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =====================================================
  // SELECT FILE
  // =====================================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setText("");
    setError("");
  };

  // =====================================================
  // SEND VOICE TO BACKEND
  // =====================================================

  const handleVoiceUpload = async () => {
    if (!file) {
      setError("Please select an audio file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setText("");

      const formData = new FormData();

      formData.append("file", file);

      console.log("Sending voice file:", file.name);

      const response = await fetch(`${API_URL}/voice`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("Voice backend response:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Voice processing failed: ${response.status}`
        );
      }

      if (data.success) {
        setText(data.text || "");

        if (!data.text) {
          setError("Voice processed, but no text was detected.");
        }
      } else {
        setError(
          data.message ||
            "Could not understand the voice."
        );
      }
    } catch (error) {
      console.error("Voice error:", error);

      setError(
        "Unable to process voice. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setFile(null);
    setText("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* HEADER */}

      <div className="mx-auto max-w-5xl">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🎙️ Voice Input
            </h1>

            <p className="mt-1 text-gray-500">
              Upload a voice recording and convert it into text.
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            🏠 Dashboard
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="font-semibold text-red-700">
              ❌ {error}
            </p>

          </div>
        )}

        {/* UPLOAD CARD */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
              🎙️
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-800">
              Upload Voice Recording
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Select an audio file to process using the backend voice
              recognition system.
            </p>

          </div>

          {/* FILE INPUT */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Select Audio File
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700"
            />

          </div>

          {/* SELECTED FILE */}

          {file && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">

              <p className="text-sm font-semibold text-emerald-800">
                ✅ Selected File
              </p>

              <p className="mt-1 break-all text-sm text-gray-700">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>

            </div>
          )}

          {/* BUTTONS */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              onClick={handleVoiceUpload}
              disabled={!file || loading}
              className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "🤖 Processing Voice..."
                : "🎙️ Convert Voice to Text"}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              🗑️ Clear
            </button>

          </div>

        </div>

        {/* RESULT */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                📝 Recognized Text
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Text returned from the backend voice recognition API.
              </p>
            </div>

            {text && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                ✅ Success
              </span>
            )}

          </div>

          {text ? (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">

              <p className="whitespace-pre-wrap text-lg leading-8 text-gray-800">
                {text}
              </p>

            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">

              <div className="text-4xl">
                🎤
              </div>

              <p className="mt-3 font-semibold text-gray-600">
                No voice text yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Upload an audio file and click Convert Voice to Text.
              </p>

            </div>
          )}

        </div>

        {/* BACKEND INFO */}

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

          <h3 className="font-bold text-blue-800">
            🤖 AI Voice Processing
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            The uploaded audio is sent to the backend
            <strong> /voice </strong>
            API. Speech recognition converts the voice into text
            and returns the recognized text to the frontend.
          </p>

          <div className="mt-3 rounded-lg bg-white p-3">

            <p className="text-xs font-semibold text-gray-500">
              Backend Endpoint
            </p>

            <p className="mt-1 font-mono text-sm text-gray-800">
              POST {API_URL}/voice
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}