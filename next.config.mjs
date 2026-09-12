/** @type {import("next").NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '15mb',
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      }
    ],
  },
};

export default nextConfig;
