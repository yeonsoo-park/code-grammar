"use client";

import { Illustration, type IllustrationName, type Tone } from "@/components/Illustration";

const NAMES: IllustrationName[] = ["book", "quiz", "magnifier", "target", "pencil", "flame", "clock", "note", "trophy", "blocks", "chart", "database", "layers", "rocket"];
const TONES: Tone[] = ["violet", "orange", "pink", "green"];

export function IconsView() {
  return (
    <main className="p-6" style={{ background: "var(--bg-page)" }}>
      {TONES.map((tone) => (
        <div key={tone} className="mb-4 flex flex-wrap gap-3">
          {NAMES.map((n) => (
            <div key={n} className="flex flex-col items-center rounded-2xl p-3" style={{ background: `var(--${tone}-50)` }}>
              <Illustration name={n} tone={tone} size={72} />
              <span className="t-caption t-sub">{n}</span>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
