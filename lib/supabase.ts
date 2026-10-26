"use client";

/**
 * Supabase 연결
 * 환경변수가 없으면 null 을 돌려줘요. 그때 앱은 지금처럼 기기에만 저장하면서 그대로 동작해요.
 * 공개 키(publishable key)는 브라우저에 보여도 괜찮은 키예요. 데이터는 RLS 정책이 지켜요.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = Boolean(url && key);

export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: {
        flowType: "pkce", // 메일 링크로 돌아오면 ?code= 를 세션으로 바꿔요
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "cg:auth",
      },
    });
  }
  return client;
}
