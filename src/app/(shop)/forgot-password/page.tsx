"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/lib/actions/auth-actions";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await forgotPassword(identifier.trim());
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-4xl font-black tracking-widest text-black uppercase" style={{ fontFamily: "Georgia, serif" }}>
              GORA
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500 tracking-widest uppercase">Reset your password</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold tracking-wide mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                If an account exists for <span className="font-bold text-black">{identifier}</span>, a password reset link has been sent to the registered email address.
              </p>
              <Link href="/login" className="inline-block mt-6 text-sm font-bold text-black underline underline-offset-2 hover:text-[#e32c2b] transition-colors">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Enter your registered email address or username. We'll send a password reset link to your email.
              </p>

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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="your@email.com or username"
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <Link href="/login" className="font-bold text-black underline underline-offset-2 hover:text-[#e32c2b] transition-colors">
                  ← Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
