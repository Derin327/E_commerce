"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldAlert, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { adminLogin, adminResetPassword, adminVerifyOtp } from "@/lib/actions/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  
  const [view, setView] = useState<"login" | "forgot" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await adminLogin(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/manager-gora");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await adminResetPassword(email);
      if (res.error) {
        setError(res.error);
      } else {
        setView("verify");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await adminVerifyOtp(email, otp);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/manager-gora");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex flex-col items-center">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-black" style={{ fontFamily: "Georgia, serif" }}>GORA</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Authorized Access Only</p>
        </div>

        {/* Form Container */}
        <div className="px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold text-center border border-red-100">
              {error}
            </div>
          )}

          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="admin@gora.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setView("forgot")} className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white font-bold py-3.5 rounded-lg hover:bg-gray-900 transition-colors flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
              </button>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-5">
              <p className="text-sm text-gray-600 font-medium text-center mb-6">
                Enter the admin email. An OTP will be sent to verify your identity.
              </p>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="admin@gora.com"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white font-bold py-3.5 rounded-lg hover:bg-gray-900 transition-colors flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
              </button>

              <button 
                type="button" 
                onClick={() => setView("login")} 
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mt-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </form>
          )}

          {view === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-sm text-gray-600 font-medium text-center mb-6">
                Enter the 6-digit OTP sent to <span className="font-bold text-black">{email}</span>
              </p>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    required 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-center tracking-[0.5em] font-bold text-xl"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white font-bold py-3.5 rounded-lg hover:bg-gray-900 transition-colors flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Access"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setView("login")} 
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mt-4"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
