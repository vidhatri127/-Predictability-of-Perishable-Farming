import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Fixes "multiple lockfiles" workspace root warning
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
