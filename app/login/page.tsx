"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ SAVE AUTH DATA
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ REDIRECT
      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md !p-6">
          <h1 className="mb-2 text-2xl font-bold">Welcome back </h1>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-dark transition-colors"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-dark transition-colors"
            />

            <Button
              onClick={handleLogin}
              className="w-full py-3"
            >
              Login
            </Button>
          </div>

          <p className="mt-6 text-center text-sm">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
