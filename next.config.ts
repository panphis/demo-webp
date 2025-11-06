import type { NextConfig } from "next";
const repo = "demo-webp";
const basePath = `/${repo}`;

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // 关键：让 Next.js 输出静态文件
  images: {
    unoptimized: true, // 禁用图片优化，静态导出需要
  },
  basePath: basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  distDir: "out",
};

export default nextConfig;
