"use client";

import { useEffect } from "react";

/**
 * 모바일 키보드가 올라오면 그 높이를 --kb-inset 변수에 넣어요.
 * 하단 고정 버튼과 보조 키 바가 이 값만큼 위로 올라가서 키보드에 가려지지 않아요.
 */
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--kb-inset", `${Math.round(inset)}px`);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      root.style.removeProperty("--kb-inset");
    };
  }, []);
}
