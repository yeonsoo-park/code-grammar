"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBook, IconHome, IconNote, IconUser } from "./icons";
import { Illustration, UNIT_ART } from "./Illustration";

export const TABS = [
  { href: "/", label: "홈", Icon: IconHome },
  { href: "/learn", label: "학습", Icon: IconBook },
  { href: "/review", label: "오답노트", Icon: IconNote },
  { href: "/me", label: "내 정보", Icon: IconUser },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** 모바일 하단 탭바 (1024px 이상에서는 사이드바로 바뀌어요) */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {TABS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>
          <Icon size={24} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export type SidebarUnit = { id: string; order: number; title: string };

/** 1024px 이상에서만 보이는 왼쪽 사이드바: 메뉴 + 유닛 바로가기 */
export function Sidebar({ units }: { units: SidebarUnit[] }) {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto px-3 py-6 lg:block" style={{ background: "var(--bg)", boxShadow: "1px 0 0 var(--border)" }}>
      <p className="t-title-3 flex items-center gap-2 px-3">
        <Illustration name="book" tone="violet" size={32} />
        코드 영문법
      </p>
      <nav className="mt-6 flex flex-col gap-1" aria-label="주요 메뉴">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="t-body-2 flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-1.5 no-underline"
              style={{
                color: active ? "var(--primary-strong)" : "var(--text-sub)",
                background: active ? "var(--primary-weak)" : undefined,
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="t-caption t-sub mt-8 px-3 font-semibold">유닛</p>
      <ul className="mt-2 flex flex-col gap-1">
        {units.map((u) => {
          const art = UNIT_ART[u.id] ?? { name: "book" as const, tone: "violet" as const };
          const active = pathname === `/learn/${u.id}`;
          return (
            <li key={u.id}>
              <Link
                href={`/learn/${u.id}`}
                aria-current={active ? "page" : undefined}
                className="t-body-2 flex min-h-11 items-center gap-2.5 rounded-xl px-2 py-1 no-underline"
                style={{ color: "var(--text-strong)", background: active ? "var(--bg-sub)" : undefined }}
              >
                <Illustration name={art.name} tone={art.tone} size={28} className="flex-none" />
                <span className="min-w-0 truncate" style={{ wordBreak: "normal" }} title={u.title}>
                  {u.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
