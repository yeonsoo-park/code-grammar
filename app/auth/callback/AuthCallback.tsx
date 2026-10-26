"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Illustration } from "@/components/Illustration";
import { getSupabase } from "@/lib/supabase";

/**
 * 메일의 로그인 링크를 누르면 여기로 와요.
 * Supabase가 주소의 ?code= 를 로그인 세션으로 바꾸면 내 정보 화면으로 보내요.
 */
export function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const linkError = params.get("error_description") || params.get("error");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || linkError) return;
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/me");
    });
    void sb.auth.getSession().then(({ data: d }) => d.session && router.replace("/me"));
    const t = setTimeout(() => setFailed(true), 10_000);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [router, linkError]);

  const error = linkError || failed;
  return (
    <main className="content flex min-h-dvh flex-col items-center justify-center text-center" aria-live="polite">
      <Illustration name="note" tone="violet" size={80} />
      {error ? (
        <>
          <h1 className="t-title-2 mt-3">로그인하지 못했어요</h1>
          <p className="t-body-2 t-sub mt-1">링크가 오래됐거나 이미 쓰였을 수 있어요. 메일을 새로 받아 주세요.</p>
          <Link href="/login" className="btn-primary mt-6 no-underline">
            로그인 메일 다시 받기
          </Link>
        </>
      ) : (
        <>
          <h1 className="t-title-2 mt-3">로그인하고 있어요</h1>
          <p className="t-body-2 t-sub mt-1">잠시만 기다려 주세요.</p>
          <div className="skeleton mt-6 w-full max-w-xs" style={{ height: "0.5rem" }} />
        </>
      )}
    </main>
  );
}
