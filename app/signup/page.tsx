"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      // Success → go to login
      router.push("/login");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md !p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Create your account 🚀
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Join Findzy and showcase your talents to fellow students
          </p>

          {error && (
            <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-dark transition-colors"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-dark transition-colors"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-dark transition-colors"
              />
            </div>


            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Login
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
