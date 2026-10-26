import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "d2coding/d2coding-subset.css";
import "./globals.css";
import { SyncStarter } from "@/components/SyncStarter";

export const metadata: Metadata = {
  title: { default: "코드 영문법", template: "%s · 코드 영문법" },
  description: "영어 공부하듯 배우는 Python·SQL — 개념, 문제, 독해, 작문",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121413" },
  ],
};

// 첫 화면이 그려지기 전에 테마를 정해서 깜빡임을 막아요.
// 저장된 설정(light/dark)이 있으면 그걸, 없으면 시스템 설정을 따라요.
const themeScript = `(function(){try{var s=localStorage.getItem("cg:theme");var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SyncStarter />
        {children}
      </body>
    </html>
  );
}
