"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || " http://10.125.207.102:8001";

type Medicine = {
  id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  reorder_level: number;
};

type ForecastItem = {
  id: number;
  name: string;
  code: string;
  currentStock: number;
  predictedDemand: number;
  trend: "High" | "Medium" | "Stable";
  recommendation: string;
};

export default function AIForecastPage() {
  const [search, setSearch] = useState("");
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET MEDICINES + AI PREDICTION
  // =========================================================

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Connecting to:", `${API_URL}/medicines`);

      // Get medicines from backend
      const medicineResponse = await fetch(
        `${API_URL}/medicines`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!medicineResponse.ok) {
        throw new Error(
          `Medicine API error: ${medicineResponse.status}`
        );
      }

      const medicines: Medicine[] =
        await medicineResponse.json();

      console.log("Medicines received:", medicines);

      // =====================================================
      // CALL AI /predict FOR EACH MEDICINE
      // =====================================================

      const predictions = await Promise.all(
        medicines.map(async (medicine) => {
          try {
            const predictionResponse = await fetch(
              `${API_URL}/predict?quantity=${medicine.quantity}&reorder_level=${medicine.reorder_level}`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                },
              }
            );

            if (!predictionResponse.ok) {
              throw new Error(
                `Prediction failed for ${medicine.medicine_name}`
              );
            }

            const prediction =
              await predictionResponse.json();

            const predictedDemand = Number(
              prediction.predicted_consumption || 0
            );

            // =================================================
            // DETERMINE DEMAND TREND
            // =================================================

            let trend: "High" | "Medium" | "Stable";

            if (
              predictedDemand >
              medicine.reorder_level
            ) {
              trend = "High";
            } else if (
              predictedDemand >
              medicine.reorder_level * 0.5
            ) {
              trend = "Medium";
            } else {
              trend = "Stable";
            }

            // =================================================
            // RECOMMENDATION
            // =================================================

            let recommendation = "";

            if (
              medicine.quantity <=
              medicine.reorder_level
            ) {
              recommendation = "Order immediately";
            } else if (
              predictedDemand >
              medicine.quantity
            ) {
              recommendation = "Increase stock";
            } else if (
              predictedDemand >
              medicine.reorder_level
            ) {
              recommendation = "Consider reordering";
            } else {
              recommendation = "Stock is sufficient";
            }

            return {
              id: medicine.id,
              name: medicine.medicine_name,
              code: medicine.batch_number,
              currentStock: medicine.quantity,
              predictedDemand,
              trend,
              recommendation,
            };
          } catch (predictionError) {
            console.error(
              "Prediction error:",
              predictionError
            );

            // If prediction fails, still show medicine
            return {
              id: medicine.id,
              name: medicine.medicine_name,
              code: medicine.batch_number,
              currentStock: medicine.quantity,
              predictedDemand: 0,
              trend: "Stable" as const,
              recommendation: "Prediction unavailable",
            };
          }
        })
      );

      setForecastData(predictions);
    } catch (err) {
      console.error("Forecast error:", err);

      setError(
        "Unable to connect to backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchForecast();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredData = useMemo(() => {
    return forecastData.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.code
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [forecastData, search]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const highDemand = forecastData.filter(
    (item) => item.trend === "High"
  ).length;

  const mediumDemand = forecastData.filter(
    (item) => item.trend === "Medium"
  ).length;

  const stableDemand = forecastData.filter(
    (item) => item.trend === "Stable"
  ).length;

  // =========================================================
  // TREND STYLE
  // =========================================================

  const getTrendStyle = (
    trend: ForecastItem["trend"]
  ) => {
    if (trend === "High") {
      return "bg-red-100 text-red-700";
    }

    if (trend === "Medium") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-green-100 text-green-700";
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            🤖 AI Forecast
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Predict medicine demand and plan your stock
          </p>
        </div>

        <button
          onClick={fetchForecast}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "🔄 Loading..." : "🔄 Refresh Forecast"}
        </button>

      </div>

      {/* AI INFO */}

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

        <div className="flex gap-4">

          <div className="text-3xl">
            🤖
          </div>

          <div>

            <h2 className="font-bold text-blue-800">
              AI Demand Prediction
            </h2>

            <p className="mt-1 text-sm text-blue-700">
              The system analyzes medicine stock and
              reorder levels using the AI prediction model
              from the backend.
            </p>

          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="font-semibold text-red-700">
            ❌ {error}
          </p>

          <p className="mt-1 text-sm text-red-600">
            Backend:
            {" "}
            {API_URL}
          </p>

        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="mt-6 rounded-xl bg-white p-10 text-center shadow">

          <div className="text-4xl">
            🤖
          </div>

          <p className="mt-3 font-semibold text-gray-700">
            AI is calculating medicine demand...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait
          </p>

        </div>
      )}

      {/* SUMMARY */}

      {!loading && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* HIGH */}

          <div className="rounded-xl border-l-4 border-red-500 bg-white p-5 shadow">

            <p className="text-sm font-semibold text-gray-500">
              🔴 High Demand
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {highDemand}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Medicines need attention
            </p>

          </div>

          {/* MEDIUM */}

          <div className="rounded-xl border-l-4 border-orange-500 bg-white p-5 shadow">

            <p className="text-sm font-semibold text-gray-500">
              🟠 Medium Demand
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {mediumDemand}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Monitor upcoming demand
            </p>

          </div>

          {/* STABLE */}

          <div className="rounded-xl border-l-4 border-green-500 bg-white p-5 shadow">

            <p className="text-sm font-semibold text-gray-500">
              🟢 Stable Demand
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {stableDemand}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Stock level is stable
            </p>

          </div>

        </div>
      )}

      {/* SEARCH */}

      {!loading && (
        <div className="mt-6 rounded-xl bg-white p-4 shadow">

          <div className="relative">

            <span className="absolute left-4 top-3.5 text-gray-400">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search medicine name or batch..."
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-500 outline-none focus:border-blue-500"
            />

          </div>

        </div>
      )}

      {/* FORECAST TABLE */}

      {!loading && (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">

          <table className="w-full min-w-[1100px]">

            <thead className="bg-blue-600 text-white">

              <tr>

                <th className="px-5 py-4 text-left">
                  Medicine
                </th>

                <th className="px-5 py-4 text-left">
                  Batch
                </th>

                <th className="px-5 py-4 text-left">
                  Current Stock
                </th>

                <th className="px-5 py-4 text-left">
                  AI Predicted Demand
                </th>

                <th className="px-5 py-4 text-left">
                  Demand Trend
                </th>

                <th className="px-5 py-4 text-left">
                  Recommendation
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No medicines found.
                  </td>

                </tr>

              ) : (

                filteredData.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50"
                  >

                    {/* MEDICINE */}

                    <td className="px-5 py-4">

                      <p className="font-semibold text-gray-800">
                        💊 {item.name}
                      </p>

                    </td>

                    {/* BATCH */}

                    <td className="px-5 py-4 text-gray-600">
                      {item.code}
                    </td>

                    {/* CURRENT STOCK */}

                    <td className="px-5 py-4">

                      <span className="font-bold text-gray-800">
                        {item.currentStock}
                      </span>

                    </td>

                    {/* PREDICTION */}

                    <td className="px-5 py-4">

                      <span className="font-bold text-blue-600">
                        {item.predictedDemand.toFixed(2)}
                      </span>

                    </td>

                    {/* TREND */}

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getTrendStyle(
                          item.trend
                        )}`}
                      >
                        {item.trend}
                      </span>

                    </td>

                    {/* RECOMMENDATION */}

                    <td className="px-5 py-4">

                      <span className="text-sm font-semibold text-gray-700">
                        {item.recommendation}
                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      )}

      {/* AI NOTE */}

      {!loading && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow">

          <h2 className="text-lg font-bold text-gray-800">
            💡 AI Recommendation
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Medicines with high predicted demand should
            be reviewed first. Consider checking current
            stock before creating a new indent.
          </p>

          <div className="mt-4 rounded-lg bg-blue-50 p-4">

            <p className="text-sm font-semibold text-blue-800">
              🧠 AI Model Status
            </p>

            <p className="mt-1 text-sm text-blue-700">
              Connected to Marunthu Stock AI backend
            </p>

          </div>

        </div>
      )}

    </main>
  );
}