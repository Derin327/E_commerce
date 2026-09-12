"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser } from "@/lib/actions/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginUser(identifier.trim(), password);
      if (result.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(result.error || "Login failed.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-4xl font-black tracking-widest text-black uppercase" style={{ fontFamily: "Georgia, serif" }}>
              GORA
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500 tracking-widest uppercase">Sign in to your account</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 mb-6 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your@email.com or username"
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-gray-500 hover:text-black transition-colors uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing In...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to GORA?{" "}
            <Link
              href={`/register${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-bold text-black underline underline-offset-2 hover:text-[#e32c2b] transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
