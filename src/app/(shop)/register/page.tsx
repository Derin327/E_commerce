"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, Phone, Mail } from "lucide-react";
import { sendWhatsAppOtp, verifyPhoneOtp, registerUser } from "@/lib/actions/auth-actions";

type Step = "form" | "verify-otp" | "success";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [step, setStep] = useState<Step>("form");

  // Form fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP fields
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Step 1: validate form and send OTPs ──────────────────
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3–20 characters, lowercase letters, numbers, or underscores.");
      return;
    }

    startTransition(async () => {
      // Send WhatsApp OTP
      const waResult = await sendWhatsAppOtp(`91${phone.replace(/\s/g, "")}`);
      if (!waResult.success) {
        setError(waResult.error || "Failed to send WhatsApp OTP.");
        return;
      }
      setInfo("A 6-digit OTP has been sent to your WhatsApp. Supabase will also send a confirmation email.");
      setStep("verify-otp");
    });
  };

  // ── Verify phone OTP ─────────────────────────────────────
  const handleVerifyPhone = () => {
    if (phoneOtp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await verifyPhoneOtp(`91${phone.replace(/\s/g, "")}`, phoneOtp);
      if (!result.success) {
        setError(result.error || "Invalid OTP.");
        return;
      }
      setPhoneVerified(true);
      setInfo("✓ Phone verified! Click 'Complete Registration' to finish.");
    });
  };

  // ── Resend WhatsApp OTP ───────────────────────────────────
  const handleResendOtp = () => {
    startTransition(async () => {
      const result = await sendWhatsAppOtp(`91${phone.replace(/\s/g, "")}`);
      setInfo(result.success ? "New OTP sent to your WhatsApp." : (result.error || "Failed."));
    });
  };

  // ── Final Registration ────────────────────────────────────
  const handleCompleteRegistration = () => {
    if (!phoneVerified) {
      setError("Please verify your phone number first.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await registerUser({
        email, password, username,
        phone: `91${phone.replace(/\s/g, "")}`,
        address, city, pincode
      });

      if (!result.success) {
        setError(result.error || "Registration failed.");
        return;
      }

      setStep("success");
    });
  };

  // ── Success ───────────────────────────────────────────────
  if (step === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black tracking-widest uppercase mb-2">Account Created!</h1>
          <p className="text-gray-500 text-sm mb-2">
            We sent a confirmation link to <span className="font-bold text-black">{email}</span>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Please check your inbox and click the link to verify your email, then log in.
          </p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="inline-block bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-4xl font-black tracking-widest text-black uppercase" style={{ fontFamily: "Georgia, serif" }}>
              GORA
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500 tracking-widest uppercase">
            {step === "form" ? "Create your account" : "Verify Your Identity"}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${step === "form" ? "text-black" : "text-green-600"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === "form" ? "bg-black text-white" : "bg-green-100 text-green-600"}`}>1</span>
            Details
          </div>
          <div className="h-px w-8 bg-gray-300" />
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${step === "verify-otp" ? "text-black" : "text-gray-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === "verify-otp" ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}>2</span>
            Verify
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 mb-6 rounded">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 mb-6 rounded">
              {info}
            </div>
          )}

          {/* ── STEP 1: Registration Form ── */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Username *</label>
                  <input
                    type="text" required value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="e.g. derin_gora"
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Email *</label>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Phone Number *</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 text-sm font-semibold text-gray-600">+91</span>
                  <input
                    type="tel" required value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> OTP will be sent via SMS</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full border border-gray-200 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Confirm Password *</label>
                <input
                  type="password" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Delivery Address</p>
                <div className="space-y-3">
                  <input
                    type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address (Street, Area)"
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <input
                      type="text" required value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Pincode"
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit" disabled={isPending}
                className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTPs...</> : "Continue to Verification →"}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === "verify-otp" && (
            <div className="space-y-6">
              {/* Phone OTP */}
              <div className={`p-4 border rounded-lg ${phoneVerified ? "border-green-300 bg-green-50" : "border-gray-200"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold uppercase tracking-wider">SMS OTP</span>
                  </div>
                  {phoneVerified && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Verified</span>}
                </div>
                <p className="text-xs text-gray-500 mb-3">Sent to <span className="font-bold">+91 {phone}</span></p>
                {!phoneVerified && (
                  <div className="flex gap-2">
                    <input
                      type="text" maxLength={6} value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit OTP"
                      className="flex-1 border border-gray-200 px-4 py-2.5 text-sm tracking-widest text-center font-bold focus:outline-none focus:border-black transition-colors"
                    />
                    <button onClick={handleVerifyPhone} disabled={isPending || phoneOtp.length !== 6}
                      className="bg-black text-white px-4 py-2.5 text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors">
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                    </button>
                  </div>
                )}
                {!phoneVerified && (
                  <button onClick={handleResendOtp} disabled={isPending} className="text-xs text-gray-500 hover:text-black underline mt-2 block transition-colors">
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Email note */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold uppercase tracking-wider">Email Verification</span>
                </div>
                <p className="text-xs text-gray-500">
                  A confirmation email will be sent to <span className="font-bold text-black">{email}</span> after registration. Click the link in that email to fully activate your account.
                </p>
              </div>

              <button
                onClick={handleCompleteRegistration}
                disabled={isPending || !phoneVerified}
                className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</> : "Complete Registration"}
              </button>

              <button onClick={() => { setStep("form"); setError(null); setInfo(null); setPhoneOtp(""); setPhoneVerified(false); }}
                className="w-full text-sm text-gray-500 hover:text-black transition-colors py-2">
                ← Back to form
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href={`/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-bold text-black underline underline-offset-2 hover:text-[#e32c2b] transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
