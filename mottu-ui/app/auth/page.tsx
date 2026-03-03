"use client";

import { useState, FormEvent, useEffect } from "react";

import { getToken, setToken } from "@/lib/auth";

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE ?? "")
    : process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (getToken()) {
      window.location.href = "/";
    }
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 409) {
        setError("An account with this email already exists.");
        return;
      }
      if (!res.ok) {
        throw new Error("Registration failed");
      }
      setRegisterSuccess(true);
      setPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error("Invalid email or password");
      }
      const data: { token: string } = await res.json();
      setToken(data.token);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-floralPink/20 via-floralPeach/20 to-floralLilac/20 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-soft border border-floralLilac/40 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-floralGreen/30 flex items-center justify-center text-floralGreen text-2xl mb-4">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-floralText mb-2">
            Account created
          </h1>
          <p className="text-sm text-floralText/80 mb-6">
            You can now log in with your email and password.
          </p>
          <button
            type="button"
            onClick={() => {
              setRegisterSuccess(false);
              setMode("login");
            }}
            className="w-full rounded-full bg-floralPink px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-floralPink/90 transition"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-floralPink/20 via-floralPeach/20 to-floralLilac/20 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-soft border border-floralLilac/40 p-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-floralText">
            Mottu Memories
          </h1>
          <p className="text-xs text-floralText/70 mt-1">
            A little garden for your favorite days
          </p>
        </div>

        <div className="flex rounded-xl bg-floralLilac/20 p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "login"
                ? "bg-white text-floralText shadow-soft"
                : "text-floralText/70 hover:text-floralText"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "register"
                ? "bg-white text-floralText shadow-soft"
                : "text-floralText/70 hover:text-floralText"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-floralText mb-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-floralLilac/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-floralText mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-floralLilac/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-floralPink px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-floralPink/90 disabled:opacity-60 transition"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-floralText mb-1">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-floralLilac/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                required
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-floralText mb-1">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-floralLilac/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                required
                minLength={1}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-floralGreen px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-floralGreen/90 disabled:opacity-60 transition"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
