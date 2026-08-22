"use client";

import { useState } from "react";

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

  const [forecastData] = useState<ForecastItem[]>([
    {
      id: 1,
      name: "Paracetamol 500mg",
      code: "PCM001",
      currentStock: 120,
      predictedDemand: 180,
      trend: "High",
      recommendation: "Increase stock",
    },
    {
      id: 2,
      name: "Amoxicillin 500mg",
      code: "AMX002",
      currentStock: 15,
      predictedDemand: 60,
      trend: "High",
      recommendation: "Order immediately",
    },
    {
      id: 3,
      name: "ORS Sachets",
      code: "ORS003",
      currentStock: 80,
      predictedDemand: 100,
      trend: "Medium",
      recommendation: "Maintain stock",
    },
    {
      id: 4,
      name: "Cetirizine 10mg",
      code: "CTZ004",
      currentStock: 50,
      predictedDemand: 45,
      trend: "Stable",
      recommendation: "Stock is sufficient",
    },
    {
      id: 5,
      name: "Omeprazole 20mg",
      code: "OMP005",
      currentStock: 75,
      predictedDemand: 120,
      trend: "Medium",
      recommendation: "Consider reordering",
    },
  ]);

  const filteredData = forecastData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  );

  const highDemand = forecastData.filter(
    (item) => item.trend === "High"
  ).length;

  const mediumDemand = forecastData.filter(
    (item) => item.trend === "Medium"
  ).length;

  const stableDemand = forecastData.filter(
    (item) => item.trend === "Stable"
  ).length;

  const getTrendStyle = (trend: ForecastItem["trend"]) => {
    if (trend === "High") {
      return "bg-red-100 text-red-700";
    }

    if (trend === "Medium") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-green-100 text-green-700";
  };

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
              The system analyzes current stock and expected
              medicine demand to identify medicines that may
              need reordering.
            </p>

          </div>

        </div>

      </div>


      {/* SUMMARY */}

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


      {/* SEARCH */}

      <div className="mt-6 rounded-xl bg-white p-4 shadow">

        <div className="relative">

          <span className="absolute left-4 top-3.5 text-gray-400">
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine name or code..."
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-500 outline-none focus:border-blue-500"
          />

        </div>

      </div>


      {/* FORECAST TABLE */}

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">

        <table className="w-full min-w-[1100px]">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="px-5 py-4 text-left">
                Medicine
              </th>

              <th className="px-5 py-4 text-left">
                Code
              </th>

              <th className="px-5 py-4 text-left">
                Current Stock
              </th>

              <th className="px-5 py-4 text-left">
                Predicted Demand
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

                  <td className="px-5 py-4">

                    <p className="font-semibold text-gray-800">
                      💊 {item.name}
                    </p>

                  </td>


                  <td className="px-5 py-4 text-gray-600">
                    {item.code}
                  </td>


                  <td className="px-5 py-4">

                    <span className="font-bold text-gray-800">
                      {item.currentStock}
                    </span>

                  </td>


                  <td className="px-5 py-4">

                    <span className="font-bold text-blue-600">
                      {item.predictedDemand}
                    </span>

                  </td>


                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getTrendStyle(
                        item.trend
                      )}`}
                    >
                      {item.trend}
                    </span>

                  </td>


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


      {/* AI NOTE */}

      <div className="mt-6 rounded-xl bg-white p-5 shadow">

        <h2 className="text-lg font-bold text-gray-800">
          💡 AI Recommendation
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Medicines with high predicted demand should be
          reviewed first. Consider checking current stock
          before creating a new indent.
        </p>

      </div>

    </main>
  );
}