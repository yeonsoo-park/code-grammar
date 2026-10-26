"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomCta } from "@/components/BottomCta";
import { IconBack } from "@/components/icons";
import { Illustration } from "@/components/Illustration";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendLoginEmail, verifyLoginCode } from "@/lib/sync";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 기술 메시지 대신 할 수 있는 행동을 알려줘요 */
function friendly(e: unknown, step: "send" | "verify") {
  const msg = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "";
  const code = e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "";
  if (/rate|seconds/i.test(msg) || code.includes("rate_limit")) return "메일을 너무 자주 보냈어요. 1분쯤 뒤에 다시 시도해 주세요.";
  if (step === "verify") return "코드가 맞지 않거나 시간이 지났어요. 메일의 코드를 다시 확인하거나, 메일을 새로 받아 주세요.";
  if (!navigator.onLine) return "인터넷 연결을 확인하고 다시 시도해 주세요.";
  return "메일을 보내지 못했어요. 주소를 확인하고 다시 시도해 주세요.";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCode, setUseCode] = useState(false);

  // 메일 링크가 새 탭에서 열려 로그인되면, 이 탭도 알아채고 넘어가요
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = sb.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace("/me");
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <h1 className="t-title-1 mt-2">로그인은 준비 중이에요</h1>
        <p className="t-body-1 t-sub mt-2">지금은 이 기기에만 기록이 저장돼요. 로그인 기능이 연결되면 다른 기기에서도 이어서 공부할 수 있어요.</p>
      </Shell>
    );
  }

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await sendLoginEmail(email.trim());
      setSentTo(email.trim());
    } catch (e) {
      setError(friendly(e, "send"));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      await verifyLoginCode(sentTo!, code.trim());
      router.replace("/me");
    } catch (e) {
      setError(friendly(e, "verify"));
      setBusy(false);
    }
  }

  if (!sentTo) {
    const valid = EMAIL_RE.test(email.trim());
    return (
      <Shell>
        <h1 className="t-title-1 mt-2">이메일로 로그인해요</h1>
        <p className="t-body-2 t-sub mt-1">비밀번호 없이, 메일로 받은 링크를 누르면 들어와요. 처음이면 자동으로 가입돼요.</p>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && !busy) void send();
          }}
        >
          <label htmlFor="email" className="t-body-2 font-semibold">
            이메일
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-2"
            placeholder="name@example.com"
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
          <ErrorText message={error} />
        </form>
        <BottomCta
          label={busy ? "보내는 중…" : "로그인 메일 받기"}
          onClick={send}
          disabled={!valid || busy}
          disabledReason={busy ? "메일을 보내고 있어요" : "이메일 주소를 입력해 주세요"}
          busy={busy}
        />
      </Shell>
    );
  }

  const codeValid = /^\d{6,10}$/.test(code.trim());
  return (
    <Shell>
      <h1 className="t-title-1 mt-2">메일함을 확인해 주세요</h1>
      <p className="t-body-1 mt-2">
        <strong className="break-all">{sentTo}</strong>(으)로 로그인 메일을 보냈어요.
      </p>
      <p className="t-body-2 t-sub mt-1">메일의 로그인 링크를 누르면 바로 들어와요. 링크가 다른 탭에서 열려도 이 화면이 알아서 넘어가요.</p>
      <p className="t-body-2 t-sub mt-1">메일이 안 보이면 스팸함도 확인해 주세요.</p>

      <div className="mt-4 flex flex-wrap gap-1">
        <button type="button" className="btn-text -ml-3" onClick={() => (setSentTo(null), setCode(""), setError(null), setUseCode(false))}>
          다른 이메일로 받기
        </button>
        {!useCode && (
          <button type="button" className="btn-text" onClick={() => setUseCode(true)} aria-expanded={false} aria-controls="code-form">
            메일에 숫자 코드가 있어요
          </button>
        )}
      </div>

      {useCode && (
        <>
          <form
            id="code-form"
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (codeValid && !busy) void verify();
            }}
          >
            <label htmlFor="code" className="t-body-2 font-semibold">
              메일의 숫자 코드
            </label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="field mt-2 tracking-[0.3em]"
              maxLength={10}
              autoFocus
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "login-error" : undefined}
            />
            <ErrorText message={error} />
          </form>
          <BottomCta
            label={busy ? "확인하는 중…" : "코드로 로그인"}
            onClick={verify}
            disabled={!codeValid || busy}
            disabledReason={busy ? "코드를 확인하고 있어요" : "메일의 숫자 코드를 입력해 주세요"}
            busy={busy}
          />
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="content min-h-dvh pt-2">
      <Link href="/me" className="icon-btn -ml-3" aria-label="내 정보로">
        <IconBack />
      </Link>
      <div className="mt-2">
        <Illustration name="note" tone="violet" size={72} />
      </div>
      {children}
    </main>
  );
}

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p id="login-error" role="alert" className="t-body-2 mt-2" style={{ color: "var(--wrong-strong)" }}>
      {message}
    </p>
  );
}
