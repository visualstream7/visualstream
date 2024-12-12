import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  serverRuntimeConfig: {
    apiTimeout: 60000,
  },
};

export default nextConfig;
