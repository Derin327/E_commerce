"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
        remove(name: string, options: CookieOptions) { cookieStore.set(name, "", options); },
      },
    }
  );
}

export async function adminLogin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) {
    return { error: "Invalid admin credentials" };
  }

  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function adminResetPassword(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) {
    return { error: "Invalid admin email" };
  }

  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    }
  });

  if (error) {
    return { error: error.message };
  }
  
  // In dev environment, Supabase Inbucket catches the email.
  console.log("~_ OTP requested for admin. Check Supabase Inbucket (or terminal) for the 6-digit code.");
  return { success: true };
}

export async function adminVerifyOtp(email: string, token: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) {
    return { error: "Invalid admin credentials" };
  }

  const supabase = getSupabase();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function adminLogout() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  return { success: true };
}
