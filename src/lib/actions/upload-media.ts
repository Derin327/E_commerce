"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadMediaAction(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
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

  // Use getUser() instead of getSession() — more reliable in server actions
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error("Upload auth failed:", authError?.message || "No user session");
    return { success: false, error: "Unauthorized. Please log in as admin." };
  }

  if (user.email !== process.env.ADMIN_EMAIL) {
    console.error("Upload denied: user email", user.email, "!= admin", process.env.ADMIN_EMAIL);
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided." };

  const isVideo = file.type.startsWith("video/");
  console.log(`Uploading ${isVideo ? "video" : "image"} to Cloudinary: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "gora-store-cms",
          resource_type: isVideo ? "video" : "image"
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            return reject(error || new Error("Failed to upload to Cloudinary"));
          }
          resolve({ secure_url: result.secure_url });
        }
      );
      uploadStream.end(buffer);
    });

    console.log("Upload success:", uploadResult.secure_url);
    return { success: true, url: uploadResult.secure_url };
  } catch (err: any) {
    console.error("Upload Error:", err);
    return { success: false, error: err.message || "Failed to upload file." };
  }
}
