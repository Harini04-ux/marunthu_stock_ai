"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();

  router.push("/dashboard");
};

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
            <span className="text-4xl">💊</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Marunthu Stock AI
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Intelligent Pharmacy Management for PHCs
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">

          <h2 className="text-2xl font-semibold text-gray-900">
            Login
          </h2>

          <p className="mt-1 mb-6 text-sm text-gray-500">
            Login using your PHC code or registered phone number
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* PHC Code / Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                PHC Code / Phone Number
              </label>

              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter PHC code or phone number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Login
            </button>

          </form>

          {/* Access Roles */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-center text-xs text-gray-500">
              Authorized access for
            </p>

            <div className="mt-3 flex justify-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Pharmacist
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Officer
              </span>

              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                DHO
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 Marunthu Stock AI • PHC Pharmacy Intelligence
        </p>

      </div>
    </main>
  );
}