import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // 왼쪽 아래 개발 배지가 하단 고정 버튼을 가려서 꺼요. 오류는 꺼도 화면에 그대로 떠요.
  devIndicators: false,
  partialPrefetching: true,
  turbopack: {
    // 홈 폴더의 다른 package-lock.json 대신 이 프로젝트 폴더를 기준으로 삼아요
    root: fileURLToPath(new URL(".", import.meta.url)),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
