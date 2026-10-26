import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallback } from "./AuthCallback";

export const metadata: Metadata = { title: "로그인하는 중" };

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}
