"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMedicines,
  type Medicine,
} from "@/lib/medicineStore";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const router = useRouter();

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // =========================================================
  // NOTIFICATION
  // =========================================================

  const [showNotifications, setShowNotifications] =
    useState(false);

  // =========================================================
  // VOICE INPUT STATE
  // =========================================================

  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  // MediaRecorder
  const [mediaRecorder, setMediaRecorder] =
    useState<MediaRecorder | null>(null);

  // =========================================================
  // BACKEND URL
  // =========================================================

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    " http://10.125.207.102:8001";

  // =========================================================
  // LOAD MEDICINES
  // =========================================================

  useEffect(() => {
    setMedicines(getMedicines());
  }, []);

  // =========================================================
  // VOICE RECORDING
  // =========================================================

  const startVoiceRecording = async () => {
    try {
      setVoiceError("");
      setVoiceText("");

      if (!navigator.mediaDevices) {
        setVoiceError(
          "Microphone is not supported in this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, {
          type: recorder.mimeType || "audio/webm",
        });

        stream.getTracks().forEach((track) =>
          track.stop()
        );

        await sendVoiceToBackend(audioBlob);
      };

      recorder.start();

      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error(error);

      setVoiceError(
        "Microphone permission denied or unavailable."
      );
    }
  };

  // =========================================================
  // STOP RECORDING
  // =========================================================

  const stopVoiceRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // =========================================================
  // SEND AUDIO TO BACKEND
  // =========================================================

  const sendVoiceToBackend = async (
    audioBlob: Blob
  ) => {
    try {
      setVoiceLoading(true);
      setVoiceError("");

      const formData = new FormData();

      formData.append(
        "file",
        audioBlob,
        "voice.webm"
      );

      const response = await fetch(
        `${API_URL}/voice`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Voice API error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("VOICE RESPONSE:", data);

      if (data.success) {
        setVoiceText(data.text || "");
      } else {
        setVoiceError(
          data.message ||
            "Could not understand the voice."
        );
      }
    } catch (error) {
      console.error("VOICE ERROR:", error);

      setVoiceError(
        "Unable to connect to voice backend."
      );
    } finally {
      setVoiceLoading(false);
    }
  };

  // =========================================================
  // STOCK COUNTS
  // =========================================================

  const lowStock = medicines.filter(
    (medicine) =>
      medicine.quantity > 0 &&
      medicine.quantity <= medicine.minimum
  ).length;

  const outOfStock = medicines.filter(
    (medicine) => medicine.quantity === 0
  ).length;

  const inStock = medicines.filter(
    (medicine) =>
      medicine.quantity > medicine.minimum
  ).length;

  // =========================================================
  // EXPIRY COUNT
  // =========================================================

  const expiringSoon = medicines.filter(
    (medicine) => {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const expiry = new Date(
        medicine.expiry
      );

      expiry.setHours(0, 0, 0, 0);

      const difference =
        expiry.getTime() -
        today.getTime();

      const daysLeft = Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      );

      return (
        daysLeft >= 0 &&
        daysLeft <= 30
      );
    }
  ).length;

  // =========================================================
  // ALERT MEDICINES
  // =========================================================

  const alertMedicines = medicines
    .filter(
      (medicine) =>
        medicine.quantity <=
        medicine.minimum
    )
    .slice(0, 5);

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const notificationMedicines =
    useMemo(() => {
      return medicines.filter(
        (medicine) => {
          const lowStockAlert =
            medicine.quantity > 0 &&
            medicine.quantity <=
              medicine.minimum;

          const outOfStockAlert =
            medicine.quantity === 0;

          const today = new Date();

          today.setHours(0, 0, 0, 0);

          const expiry = new Date(
            medicine.expiry
          );

          expiry.setHours(0, 0, 0, 0);

          const difference =
            expiry.getTime() -
            today.getTime();

          const daysLeft = Math.ceil(
            difference /
              (1000 * 60 * 60 * 24)
          );

          const expirySoonAlert =
            daysLeft >= 0 &&
            daysLeft <= 30;

          const expiredAlert =
            daysLeft < 0;

          return (
            lowStockAlert ||
            outOfStockAlert ||
            expirySoonAlert ||
            expiredAlert
          );
        }
      );
    }, [medicines]);

  const notificationCount =
    notificationMedicines.length;

  // =========================================================
  // NOTIFICATION DETAILS
  // =========================================================

  const getNotificationDetails = (
    medicine: Medicine
  ) => {
    if (medicine.quantity === 0) {
      return {
        icon: "🚨",
        title: "Out of Stock",
        message: `${medicine.name} is completely out of stock.`,
        color: "text-red-700",
        bg: "bg-red-50",
      };
    }

    if (
      medicine.quantity > 0 &&
      medicine.quantity <=
        medicine.minimum
    ) {
      return {
        icon: "⚠️",
        title: "Low Stock",
        message: `${medicine.name} has only ${medicine.quantity} units remaining.`,
        color: "text-orange-700",
        bg: "bg-orange-50",
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const expiry = new Date(
      medicine.expiry
    );

    expiry.setHours(0, 0, 0, 0);

    const difference =
      expiry.getTime() -
      today.getTime();

    const daysLeft = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return {
        icon: "❌",
        title: "Expired",
        message: `${medicine.name} has expired.`,
        color: "text-red-700",
        bg: "bg-red-50",
      };
    }

    if (daysLeft <= 30) {
      return {
        icon: "⏰",
        title: "Expiry Soon",
        message: `${medicine.name} expires in ${daysLeft} days.`,
        color: "text-yellow-700",
        bg: "bg-yellow-50",
      };
    }

    return {
      icon: "🔔",
      title: "Notification",
      message: `${medicine.name} needs attention.`,
      color: "text-gray-700",
      bg: "bg-gray-50",
    };
  };

  // =========================================================
  // BAR CHART
  // =========================================================

  const stockChartData =
    medicines.map((medicine) => ({
      name:
        medicine.name.length > 14
          ? medicine.name.substring(
              0,
              14
            ) + "..."
          : medicine.name,

      current:
        medicine.quantity,

      minimum:
        medicine.minimum,
    }));

  // =========================================================
  // PIE CHART
  // =========================================================

  const statusChartData = [
    {
      name: "In Stock",
      value: inStock,
    },
    {
      name: "Low Stock",
      value: lowStock,
    },
    {
      name: "Out of Stock",
      value: outOfStock,
    },
  ];

  const pieColors = [
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b bg-white">

        <div className="flex h-full items-center justify-between px-5">

          <div className="flex items-center gap-2">

            <div className="text-xl">
              💊
            </div>

            <div>
              <h1 className="text-sm font-bold text-emerald-700">
                Marunthu Stock AI
              </h1>

              <p className="text-[9px] text-gray-500">
                PHC Pharmacy Management System
              </p>
            </div>

          </div>

          {/* RIGHT HEADER */}

          <div className="flex items-center gap-5">

            {/* ================================================= */}
            {/* VOICE BUTTON */}
            {/* ================================================= */}

            <div className="relative">

              <button
                onClick={
                  isRecording
                    ? stopVoiceRecording
                    : startVoiceRecording
                }
                disabled={voiceLoading}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  isRecording
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >

                <span className="text-base">
                  {isRecording
                    ? "⏹️"
                    : "🎤"}
                </span>

                {isRecording
                  ? "Stop"
                  : voiceLoading
                  ? "Processing..."
                  : "Voice"}

              </button>

              {/* VOICE RESULT */}

              {(voiceText ||
                voiceError) && (
                <div className="absolute right-0 top-12 z-[100] w-80 rounded-xl border bg-white p-4 shadow-2xl">

                  <div className="mb-2 flex items-center justify-between">

                    <h3 className="text-xs font-bold text-gray-800">
                      Voice Result
                    </h3>

                    <button
                      onClick={() => {
                        setVoiceText("");
                        setVoiceError("");
                      }}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      ✕
                    </button>

                  </div>

                  {voiceText && (
                    <div className="rounded-lg bg-emerald-50 p-3">

                      <p className="text-[10px] text-gray-500">
                        Recognized text
                      </p>

                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        🎤 {voiceText}
                      </p>

                    </div>
                  )}

                  {voiceError && (
                    <div className="rounded-lg bg-red-50 p-3">

                      <p className="text-xs font-semibold text-red-700">
                        ❌ {voiceError}
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* ================================================= */}
            {/* NOTIFICATION */}
            {/* ================================================= */}

            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
                className="relative rounded-full p-2 text-xl transition hover:bg-gray-100"
                aria-label="Notifications"
              >

                🔔

                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {notificationCount > 99
                      ? "99+"
                      : notificationCount}
                  </span>
                )}

              </button>

              {showNotifications && (

                <div className="absolute right-0 top-12 z-[100] w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

                  <div className="flex items-center justify-between border-b bg-white p-4">

                    <div>

                      <h3 className="text-sm font-bold text-gray-800">
                        Notifications
                      </h3>

                      <p className="mt-1 text-[10px] text-gray-500">
                        {notificationCount} alert(s)
                      </p>

                    </div>

                    <div className="text-xl">
                      🔔
                    </div>

                  </div>

                  <div className="max-h-80 overflow-y-auto">

                    {notificationCount === 0 ? (

                      <div className="p-7 text-center">

                        <div className="text-4xl">
                          ✅
                        </div>

                        <p className="mt-3 text-xs font-bold text-green-700">
                          No new notifications
                        </p>

                      </div>

                    ) : (

                      notificationMedicines
                        .slice(0, 5)
                        .map(
                          (medicine) => {

                            const notification =
                              getNotificationDetails(
                                medicine
                              );

                            return (
                              <div
                                key={medicine.id}
                                className={`border-b px-4 py-3 transition hover:bg-gray-50 ${notification.bg}`}
                              >

                                <div className="flex items-start gap-3">

                                  <div className="text-lg">
                                    {
                                      notification.icon
                                    }
                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <p
                                      className={`text-xs font-bold ${notification.color}`}
                                    >
                                      {
                                        notification.title
                                      }
                                    </p>

                                    <p className="mt-1 text-[10px] text-gray-600">
                                      {
                                        notification.message
                                      }
                                    </p>

                                    <p className="mt-1 text-[9px] text-gray-400">
                                      Batch:{" "}
                                      {
                                        medicine.batch
                                      }
                                    </p>

                                  </div>

                                </div>

                              </div>
                            );
                          }
                        )

                    )}

                  </div>

                  <div className="border-t bg-white p-3">

                    <button
                      onClick={() => {
                        setShowNotifications(
                          false
                        );

                        router.push(
                          "/alerts"
                        );
                      }}
                      className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      View All Alerts
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* PHARMACIST */}

            <div className="text-right">

              <p className="text-xs font-semibold text-gray-800">
                Pharmacist
              </p>

              <p className="text-[9px] text-gray-400">
                PHC-TVL-001
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="fixed bottom-0 left-0 top-14 z-40 w-40 border-r bg-white">

        <nav className="p-3">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mb-2 flex w-full items-center gap-2 rounded-md bg-emerald-600 px-3 py-2.5 text-left text-xs font-medium text-white"
          >
            🏠
            <span>Dashboard</span>
          </button>

          <button
            onClick={() =>
              router.push(
                "/medicine-stock"
              )
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            💊
            <span>Medicines</span>
          </button>

          <button
            onClick={() =>
              router.push("/stock")
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            📦
            <span>Stock</span>
          </button>

          <button
            onClick={() =>
              router.push("/bill-ocr")
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🧾
            <span>Bill OCR</span>
          </button>

          <button
            onClick={() =>
              router.push(
                "/ai-forecast"
              )
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🤖
            <span>AI Forecast</span>
          </button>

          <button
            onClick={() =>
              router.push("/alerts")
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🔔
            <span>Alerts</span>

            {notificationCount >
              0 && (
              <span className="ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                {notificationCount}
              </span>
            )}

          </button>

          <button
            onClick={() =>
              router.push("/indent")
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            📄
            <span>Indent</span>
          </button>

          <button
            onClick={() =>
              router.push(
                "/dho-dashboard"
              )
            }
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-100"
          >
            🏥
            <span>DHO Dashboard</span>
          </button>

          <button
            onClick={() =>
              router.push("/")
            }
            className="mt-4 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-50"
          >
            🚪
            <span>Logout</span>
          </button>

        </nav>

      </aside>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <section className="ml-40 pt-14">

        <div className="p-5">

          {/* WELCOME */}

          <div className="mb-5">

            <h2 className="text-xl font-bold text-gray-900">
              Welcome, Pharmacist 👋
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Here's your PHC medicine overview for today.
            </p>

          </div>

          {/* ================================================= */}
          {/* VOICE INPUT CARD */}
          {/* ================================================= */}

          <div className="mb-5 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="text-2xl">
                    🎤
                  </span>

                  <h3 className="text-sm font-bold text-gray-800">
                    Voice Input
                  </h3>

                </div>

                <p className="mt-1 text-[10px] text-gray-500">
                  Speak your request and the system will convert your voice into text.
                </p>

                {voiceText && (
                  <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3">

                    <p className="text-[10px] text-gray-500">
                      Recognized text
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      "{voiceText}"
                    </p>

                  </div>
                )}

                {voiceError && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    ❌ {voiceError}
                  </p>
                )}

              </div>

              <button
                onClick={
                  isRecording
                    ? stopVoiceRecording
                    : startVoiceRecording
                }
                disabled={voiceLoading}
                className={`min-w-[150px] rounded-xl px-5 py-4 text-sm font-bold shadow-sm transition ${
                  isRecording
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >

                <div className="text-2xl">
                  {isRecording
                    ? "⏹️"
                    : "🎤"}
                </div>

                <div className="mt-1">
                  {isRecording
                    ? "Stop Recording"
                    : voiceLoading
                    ? "Processing..."
                    : "Start Voice"}
                </div>

              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* SUMMARY CARDS */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm">

              <p className="text-[11px] text-gray-500">
                Low Stock
              </p>

              <h3 className="mt-1 text-2xl font-bold text-red-600">
                {lowStock}
              </h3>

              <p className="mt-1 text-[10px] text-gray-500">
                Medicines need attention
              </p>

            </div>

            <div className="rounded-lg border-l-4 border-orange-500 bg-white p-4 shadow-sm">

              <p className="text-[11px] text-gray-500">
                Expiring Soon
              </p>

              <h3 className="mt-1 text-2xl font-bold text-orange-500">
                {expiringSoon}
              </h3>

              <p className="mt-1 text-[10px] text-gray-500">
                Batches within 30 days
              </p>

            </div>

            <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">

              <p className="text-[11px] text-gray-500">
                AI Forecast Alerts
              </p>

              <h3 className="mt-1 text-2xl font-bold text-blue-600">
                3
              </h3>

              <p className="mt-1 text-[10px] text-gray-500">
                Demand changes detected
              </p>

            </div>

            <div className="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-sm">

              <p className="text-[11px] text-gray-500">
                Pending Indent
              </p>

              <h3 className="mt-1 text-2xl font-bold text-emerald-600">
                1
              </h3>

              <p className="mt-1 text-[10px] text-gray-500">
                Awaiting submission
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* CHARTS */}
          {/* ================================================= */}

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">

            <div className="rounded-lg bg-white p-4 shadow-sm xl:col-span-2">

              <div className="mb-4">

                <h3 className="text-sm font-bold text-gray-800">
                  Medicine Stock Overview
                </h3>

                <p className="mt-1 text-[10px] text-gray-500">
                  Current stock compared with minimum required stock
                </p>

              </div>

              <div className="h-[300px] w-full">

                {stockChartData.length === 0 ? (

                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    No medicine data available
                  </div>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={stockChartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 50,
                      }}
                    >

                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="name"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10 }}
                      />

                      <Tooltip />

                      <Legend />

                      <Bar
                        dataKey="current"
                        name="Current Stock"
                        fill="#10b981"
                        radius={[
                          4,
                          4,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="minimum"
                        name="Minimum Stock"
                        fill="#ef4444"
                        radius={[
                          4,
                          4,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                )}

              </div>

            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">

              <div className="mb-4">

                <h3 className="text-sm font-bold text-gray-800">
                  Stock Status
                </h3>

                <p className="mt-1 text-[10px] text-gray-500">
                  Medicine availability summary
                </p>

              </div>

              <div className="h-[300px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >

                      {statusChartData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              pieColors[index]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">

            <h3 className="mb-3 text-sm font-bold text-gray-800">
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

              <button
                onClick={() =>
                  router.push(
                    "/medicine-stock"
                  )
                }
                className="rounded-md bg-emerald-50 p-4 text-left transition hover:bg-emerald-100"
              >

                <div className="mb-2 text-lg">
                  💊
                </div>

                <p className="text-xs font-bold text-emerald-700">
                  Manage Medicines
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Add and manage medicines
                </p>

              </button>

              <button
                onClick={() =>
                  router.push("/stock")
                }
                className="rounded-md bg-blue-50 p-4 text-left transition hover:bg-blue-100"
              >

                <div className="mb-2 text-lg">
                  📦
                </div>

                <p className="text-xs font-bold text-blue-700">
                  Manage Stock
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Stock in and stock out
                </p>

              </button>

              <button
                onClick={() =>
                  router.push(
                    "/bill-ocr"
                  )
                }
                className="rounded-md bg-orange-50 p-4 text-left transition hover:bg-orange-100"
              >

                <div className="mb-2 text-lg">
                  🧾
                </div>

                <p className="text-xs font-bold text-orange-700">
                  Upload Medicine Bill
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Scan bill using OCR
                </p>

              </button>

              <button
                onClick={() =>
                  router.push(
                    "/ai-forecast"
                  )
                }
                className="rounded-md bg-blue-50 p-4 text-left transition hover:bg-blue-100"
              >

                <div className="mb-2 text-lg">
                  🤖
                </div>

                <p className="text-xs font-bold text-blue-700">
                  AI Forecast
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Check medicine demand
                </p>

              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* RECENT ALERTS */}
          {/* ================================================= */}

          <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h3 className="text-sm font-bold text-gray-800">
                  Recent Alerts
                </h3>

                <p className="mt-1 text-[10px] text-gray-500">
                  Latest medicine stock alerts
                </p>

              </div>

              <button
                onClick={() =>
                  router.push(
                    "/alerts"
                  )
                }
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                View All
              </button>

            </div>

            {alertMedicines.length === 0 ? (

              <div className="rounded-md bg-green-50 px-4 py-3">

                <p className="text-xs font-bold text-green-700">
                  🟢 All medicines are sufficiently stocked.
                </p>

              </div>

            ) : (

              alertMedicines.map(
                (medicine) => (

                  <div
                    key={medicine.id}
                    className="mb-2 flex items-center justify-between rounded-md bg-red-50 px-4 py-3"
                  >

                    <div>

                      <p className="text-xs font-bold text-red-700">
                        🔴{" "}
                        {medicine.name}
                      </p>

                      <p className="text-[10px] text-gray-600">
                        Stock:{" "}
                        {medicine.quantity}{" "}
                        | Minimum:{" "}
                        {medicine.minimum}
                      </p>

                    </div>

                    <span className="text-[9px] font-bold text-red-600">

                      {medicine.quantity ===
                      0
                        ? "OUT"
                        : "LOW"}

                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>

    </main>
  );
}