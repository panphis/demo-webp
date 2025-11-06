import type { NextConfig } from "next";

// 从环境变量获取仓库名称，如果没有则使用默认值
// 如果是 GitHub Pages 自定义域名部署，可以设置 GITHUB_REPOSITORY 为空字符串
const repo = process.env.GITHUB_REPOSITORY || "demo-webp";
// 判断是否是自定义域名（通过环境变量控制）
const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";
// 如果是自定义域名或根域名部署，basePath 为空
const basePath = isCustomDomain || !repo ? "" : `/${repo}`;

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // 关键：让 Next.js 输出静态文件
  images: {
    unoptimized: true, // 禁用图片优化，静态导出需要
  },
  // 设置 basePath 和 assetPrefix，确保所有资源路径正确
  basePath: basePath,
  assetPrefix: basePath,
  // 添加尾部斜杠，确保 GitHub Pages 路由正确
  trailingSlash: true,
  // 确保静态资源路径在生产环境中正确
  distDir: "out",
};

export default nextConfig;
