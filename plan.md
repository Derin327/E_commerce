# GORA E-Commerce: Phased Integration & QA Plan

This document outlines the development phases for the GORA project. Use the bullet points under each phase to verify that all critical features and third-party integrations are functioning correctly before moving to the next phase.

---

### Phase 0: Project Setup
*Goal: Initialize the codebase and core services.*
- [ ] **Next.js & Tailwind:** Verify the project runs locally and the minimalist black & white theme is applied.
- [ ] **Supabase:** Confirm the database project is created and API keys are stored in `.env.local`.
- [ ] **Cloudflare R2:** Ensure the R2 bucket is created and access keys are ready.

---

### Phase 1: Core Frontend (Homepage & Shop)
*Goal: Build the visual foundation.*
- [ ] **UI Components:** Verify `ProductCard`, `CategoryGrid`, and `HeroBanner` match the design system.
- [ ] **Mobile Responsiveness:** Test the `SwipeableCarousel` on mobile views to ensure smooth horizontal snapping.
- [ ] **Navigation:** Check that the sticky header and all mock links operate correctly.

---

### Phase 2: Product Detail & Client-Side Cart
*Goal: Enable product browsing and cart management without backend sync.*
- [ ] **Zustand Store:** Verify that clicking "Add to Cart" updates the cart badge in the header instantly.
- [ ] **Cart Drawer:** Open the cart drawer and test increasing/decreasing quantity and removing items.
- [ ] **Image Gallery:** Ensure thumbnail clicking updates the main image, and click-to-zoom works.
- [ ] **WhatsApp Integration (Basic):** Click the "Order on WhatsApp" button and verify it opens a chat with a pre-filled message containing the correct item size, color, and price.

---

### Phase 3: Authentication (Supabase)
*Goal: Allow users to sign up, log in, and manage accounts.*
- [ ] **Supabase Auth Integration:** Verify that a new user can sign up via Email/Password.
- [ ] **OTP / Verification:** Check if the verification email or SMS arrives successfully.
- [ ] **Session Management:** Confirm that logging in updates the UI (e.g., User icon goes to Account page) and logging out clears the session.
- [ ] **Protected Routes:** Ensure non-logged-in users cannot access the `/account` or `/orders` pages.

---

### Phase 4: Checkout & Orders (Razorpay + Supabase)
*Goal: Process real payments and store orders.*
- [ ] **Razorpay Integration:** Trigger a test payment and verify the Razorpay modal opens successfully.
- [ ] **Payment Webhooks:** Confirm that a successful test payment updates the order status in Supabase via webhook.
- [ ] **Database Writes:** Verify that completed orders are correctly inserted into the `orders` and `order_items` tables in Supabase.
- [ ] **Order Confirmation:** Ensure the user is redirected to a success page with their Order ID after payment.

---

### Phase 5: Admin Dashboard Core
*Goal: Enable store management for admins.*
- [ ] **Role-Based Access:** Verify that only users with `is_admin = true` in Supabase can access `/admin`.
- [ ] **Product CRUD:** Test adding a new product via the admin panel and ensure it immediately appears on the storefront.
- [ ] **Variant Management:** Ensure you can add/remove sizes and colors for a product.
- [ ] **Order Management:** Test updating an order status (e.g., Pending -> Shipped) and confirm the change saves to the database.

---

### Phase 6: Advanced Image Management (Cloudflare R2)
*Goal: Replace placeholders with an automated image pipeline.*
- [ ] **R2 Upload Integration:** Upload an image from the admin panel and verify it saves to the Cloudflare R2 bucket.
- [ ] **Image Processing:** Ensure the system automatically resizes uploaded images into Thumbnail, Product, and Zoom variants.
- [ ] **Database Sync:** Confirm the image URLs from R2 are correctly linked to the respective product in the `dress_images` table.
- [ ] **Frontend Delivery:** Verify the storefront loads the optimized R2 images instead of placeholders.

---

### Phase 7: Polish & Advanced Integrations
*Goal: Automate notifications and optimize performance.*
- [ ] **WhatsApp Cloud API Integration:** Verify that an automated WhatsApp order confirmation is sent to the customer upon successful payment.
- [ ] **Email Notifications:** Confirm shipping updates trigger emails (via SendGrid/Resend).
- [ ] **Performance:** Run a Lighthouse audit and ensure lazy loading and image optimization are resulting in high scores.

---

### Phase 8: Launch Preparation
*Goal: Go live.*
- [ ] **Production Keys:** Swap all test API keys (Razorpay, Supabase, WhatsApp) for live keys.
- [ ] **Domain & SSL:** Verify the custom domain is connected and HTTPS is active.
- [ ] **Final QA:** Perform one last end-to-end test (Signup -> Add to Cart -> Pay -> Admin Fulfillment -> WhatsApp Notification).
