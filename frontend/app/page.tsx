"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const validLoginId = "PHC-TVL-001";
    const validPassword = "admin123";

    // ==============================
    // VALIDATE EMPTY FIELDS
    // ==============================

    if (!loginId.trim() || !password) {
      setError("Please enter PHC Code and Password.");
      return;
    }

    // ==============================
    // START LOGIN
    // ==============================

    setLoading(true);

    // ==============================
    // CHECK LOGIN DETAILS
    // ==============================

    if (
      loginId.trim() === validLoginId &&
      password === validPassword
    ) {
      // ==============================
      // SAVE SESSION DATA
      // ==============================

      sessionStorage.setItem(
        "marunthu_authenticated",
        "true"
      );

      sessionStorage.setItem(
        "user_role",
        "Pharmacist"
      );

      sessionStorage.setItem(
        "phc_code",
        validLoginId
      );

      // ==============================
      // SAVE AUTHENTICATION COOKIE
      // Proxy checks this cookie
      // ==============================

      document.cookie =
        "marunthu_authenticated=true; path=/; max-age=86400; SameSite=Lax";

      // ==============================
      // SAVE USER ROLE COOKIE
      // ==============================

      document.cookie =
        "user_role=Pharmacist; path=/; max-age=86400; SameSite=Lax";

      // ==============================
      // SAVE PHC CODE COOKIE
      // ==============================

      document.cookie =
        `phc_code=${validLoginId}; path=/; max-age=86400; SameSite=Lax`;

      // ==============================
      // GO TO DASHBOARD
      // ==============================

      router.replace("/dashboard");
    } else {
      // ==============================
      // INVALID LOGIN
      // ==============================

      setLoading(false);

      setError(
        "Invalid PHC Code or Password."
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">

      <div className="w-full max-w-md">

        {/* ================= HEADER ================= */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">

            <span className="text-4xl">
              💊
            </span>

          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Marunthu Stock AI
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Intelligent Pharmacy Management for PHCs
          </p>

        </div>

        {/* ================= LOGIN CARD ================= */}

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">

          <h2 className="text-2xl font-semibold text-gray-900">
            Login
          </h2>

          <p className="mb-6 mt-1 text-sm text-gray-500">
            Login using your PHC code or registered phone number
          </p>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* ================= PHC CODE ================= */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                PHC Code / Phone Number
              </label>

              <input
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setError("");
                }}
                placeholder="Enter PHC code"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

            {/* ================= PASSWORD ================= */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

            {/* ================= ERROR ================= */}

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                ❌ {error}
              </div>
            )}

            {/* ================= LOGIN BUTTON ================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Login"}
            </button>

          </form>

          {/* ================= DEMO LOGIN ================= */}

          <div className="mt-6 rounded-lg bg-gray-50 p-4">

            <p className="text-center text-xs font-semibold text-gray-600">
              Demo Login
            </p>

            <p className="mt-2 text-center text-xs text-gray-500">
              PHC Code:{" "}
              <span className="font-semibold text-gray-700">
                PHC-TVL-001
              </span>
            </p>

            <p className="text-center text-xs text-gray-500">
              Password:{" "}
              <span className="font-semibold text-gray-700">
                admin123
              </span>
            </p>

          </div>

          {/* ================= ROLES ================= */}

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

        {/* ================= FOOTER ================= */}

        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 Marunthu Stock AI • PHC Pharmacy Intelligence
        </p>

      </div>

    </main>
  );
}