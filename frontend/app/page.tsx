"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  "https://proteins-shape-vacuum-downloaded.trycloudflare.com";

export default function Home() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!loginId.trim() || !password) {
      setError(
        "Please enter PHC Code / Username and Password."
      );
      return;
    }

    setLoading(true);

    try {
      console.log("API URL:", API_URL);
      console.log(
        "LOGIN URL:",
        `${API_URL}/login`
      );

      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            username: loginId.trim(),
            password: password,
          }),
        }
      );

      // ==========================================
      // READ RESPONSE AS TEXT FIRST
      // ==========================================

      const responseText = await response.text();

      console.log(
        "BACKEND STATUS:",
        response.status
      );

      console.log(
        "BACKEND RESPONSE:",
        responseText
      );

      // ==========================================
      // CONVERT JSON
      // ==========================================

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "Backend did not return JSON:",
          responseText
        );

        setError(
          "Backend returned an invalid response. Please check the FastAPI URL."
        );

        setLoading(false);
        return;
      }

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      // ==========================================
      // BACKEND ERROR
      // ==========================================

      if (!response.ok) {
        setError(
          data?.detail ||
            data?.message ||
            "Login failed."
        );

        setLoading(false);
        return;
      }

      // ==========================================
      // SUCCESS CHECK
      // ==========================================

      if (!data?.success) {
        setError(
          data?.message ||
            "Invalid username or password."
        );

        setLoading(false);
        return;
      }

      // ==========================================
      // GET TOKEN + USER
      // ==========================================

      const token =
        data?.access_token;

      const user =
        data?.user;

      if (!token) {
        setError(
          "Login successful, but access token was not received."
        );

        setLoading(false);
        return;
      }

      // ==========================================
      // SAVE JWT TOKEN
      // ==========================================

      sessionStorage.setItem(
        "access_token",
        token
      );

      // ==========================================
      // SAVE AUTHENTICATION
      // ==========================================

      sessionStorage.setItem(
        "marunthu_authenticated",
        "true"
      );

      // ==========================================
      // SAVE ROLE
      // ==========================================

      sessionStorage.setItem(
        "user_role",
        user?.role ||
          "pharmacist"
      );

      // ==========================================
      // SAVE PHC CODE
      // ==========================================

      sessionStorage.setItem(
        "phc_code",
        user?.username ||
          loginId.trim()
      );

      sessionStorage.setItem(
        "username",
        user?.username ||
          loginId.trim()
      );

      // ==========================================
      // AUTH COOKIE
      // ==========================================

      document.cookie =
        "marunthu_authenticated=true; path=/; max-age=86400; SameSite=Lax";

      // ==========================================
      // ROLE COOKIE
      // ==========================================

      document.cookie =
        `user_role=${encodeURIComponent(
          user?.role ||
            "pharmacist"
        )}; path=/; max-age=86400; SameSite=Lax`;

      // ==========================================
      // PHC COOKIE
      // ==========================================

      document.cookie =
        `phc_code=${encodeURIComponent(
          user?.username ||
            loginId.trim()
        )}; path=/; max-age=86400; SameSite=Lax`;

      // ==========================================
      // TOKEN COOKIE
      // ==========================================

      document.cookie =
        `access_token=${encodeURIComponent(
          token
        )}; path=/; max-age=86400; SameSite=Lax`;

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================

      console.log(
        "LOGIN SUCCESS"
      );

      console.log(
        "Username:",
        user?.username
      );

      console.log(
        "Role:",
        user?.role
      );

      // ==========================================
      // DASHBOARD
      // ==========================================

      router.replace(
        "/dashboard"
      );

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        "Cannot connect to backend. Please make sure FastAPI and Cloudflare Tunnel are running."
      );

      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">

      <div className="w-full max-w-md">

        {/* HEADER */}

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

        {/* LOGIN CARD */}

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">

          <h2 className="text-2xl font-semibold text-gray-900">
            Login
          </h2>

          <p className="mb-6 mt-1 text-sm text-gray-500">
            Login using your PHC code or registered username
          </p>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* USERNAME */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                PHC Code / Username
              </label>

              <input
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(
                    e.target.value
                  );
                  setError("");
                }}
                placeholder="Enter PHC code"
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-100"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );
                  setError("");
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-100"
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                ❌ {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Login"}
            </button>

          </form>

          {/* DEMO LOGIN */}

          <div className="mt-6 rounded-lg bg-gray-50 p-4">

            <p className="text-center text-xs font-semibold text-gray-600">
              Demo Login
            </p>

            <p className="mt-2 text-center text-xs text-gray-500">
              Username:
              <span className="ml-1 font-semibold text-gray-700">
                PHC-TVL-001
              </span>
            </p>

            <p className="text-center text-xs text-gray-500">
              Password:
              <span className="ml-1 font-semibold text-gray-700">
                admin123
              </span>
            </p>

          </div>

          {/* ROLES */}

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

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 Marunthu Stock AI • PHC Pharmacy Intelligence
        </p>

      </div>

    </main>
  );
}