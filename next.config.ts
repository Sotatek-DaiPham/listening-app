import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg', '@ffmpeg-installer/win32-x64', 'fluent-ffmpeg'],
};

export default nextConfig;
