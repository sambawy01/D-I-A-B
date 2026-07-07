import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Drizzle uses the `postgres` driver on the server only.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
