"use client";

import { useEffect, useSyncExternalStore } from "react";
import { startSync } from "@/lib/sync";
import { IconAlert } from "./icons";

/** 앱이 열리면 동기화를 시작하고, 오프라인이면 상단에 알려요 */
export function SyncStarter() {
  useEffect(() => startSync(), []);
  const online = useSyncExternalStore(
    (l) => {
      window.addEventListener("online", l);
      window.addEventListener("offline", l);
      return () => {
        window.removeEventListener("online", l);
        window.removeEventListener("offline", l);
      };
    },
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;
  return (
    <div className="banner sticky top-0 z-50 rounded-none" role="status">
      <IconAlert size={18} className="mt-0.5 flex-none" />
      <span>인터넷이 끊겼어요. 공부한 기록은 이 기기에 저장해 두었다가, 다시 연결되면 올릴게요.</span>
    </div>
  );
}
