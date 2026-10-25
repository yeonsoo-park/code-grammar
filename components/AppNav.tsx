"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBook, IconHome, IconNote, IconUser } from "./icons";

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

export type SidebarUnit = { id: string; title: string; lessons: { id: string; title: string }[] };

/** 1024px 이상에서만 보이는 왼쪽 사이드바: 메뉴 + 유닛 목록 */
export function Sidebar({ units }: { units: SidebarUnit[] }) {
  const pathname = usePathname();
  return (
    <aside
      className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r px-4 py-6 lg:block"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <p className="t-title-3 px-3">코드 영문법</p>
      <nav className="mt-6 flex flex-col gap-1" aria-label="주요 메뉴">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 no-underline"
              style={{
                color: active ? "var(--text-strong)" : "var(--text-sub)",
                background: active ? "var(--bg-sub)" : undefined,
                fontWeight: active ? 700 : 500,
              }}
            >
              <span style={{ color: active ? "var(--primary)" : undefined }}>
                <Icon size={22} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">
        <p className="t-caption t-sub px-3">유닛</p>
        <ul className="mt-2 flex flex-col gap-3">
          {units.map((u) => (
            <li key={u.id}>
              <p className="t-body-2 px-3 font-semibold">{u.title}</p>
              <ul className="mt-1">
                {u.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/lesson/${l.id}`}
                      className="t-body-2 block truncate rounded-lg px-3 py-2 no-underline"
                      style={{ color: "var(--text-sub)", wordBreak: "normal" }}
                      title={l.title}
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
