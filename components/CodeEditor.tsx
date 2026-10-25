"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting, indentUnit, bracketMatching } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";

// 코드 색은 tokens.css 의 --code-* 변수만 써요 (파란 키워드 없음)
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.bool, t.null, t.controlKeyword, t.operatorKeyword], color: "var(--code-keyword)", fontWeight: "600" },
  { tag: [t.string, t.special(t.string)], color: "var(--code-string)" },
  { tag: [t.number], color: "var(--code-number)" },
  { tag: [t.comment, t.lineComment], color: "var(--code-comment)", fontStyle: "italic" },
  { tag: [t.function(t.variableName)], color: "var(--code-keyword)" },
]);

export type EditorHandle = { insert: (text: string) => void; focus: () => void };

/** 작문용 코드 에디터 (CodeMirror 6). 모바일에서도 가볍고 터치 입력이 안정적이에요. */
export function CodeEditor({
  initial,
  onChange,
  label,
  handleRef,
  onFocusChange,
}: {
  initial: string;
  onChange: (code: string) => void;
  label: string;
  handleRef?: React.RefObject<EditorHandle | null>;
  onFocusChange?: (focused: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocusChange);
  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocusChange;
  });

  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          bracketMatching(),
          indentUnit.of("    "),
          python(),
          syntaxHighlighting(highlight),
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
          // 하단 고정 버튼·보조 키 바에 커서가 가려지지 않게 여유를 둬요
          EditorView.scrollMargins.of(() => ({ bottom: 200, top: 80 })),
          EditorView.contentAttributes.of({
            "aria-label": label,
            autocapitalize: "off",
            autocorrect: "off",
            spellcheck: "false",
            inputmode: "text",
          }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
            if (u.focusChanged) onFocusRef.current?.(u.view.hasFocus);
          }),
        ],
      }),
    });
    if (handleRef) {
      handleRef.current = {
        insert(text: string) {
          const { from, to } = view.state.selection.main;
          view.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length }, scrollIntoView: true });
          view.focus();
        },
        focus: () => view.focus(),
      };
    }
    return () => view.destroy();
    // initial 은 처음 한 번만 써요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} className="editor" />;
}

/** 모바일 키보드에서 치기 어려운 기호를 한 번에 넣는 보조 키 */
export const HELPER_KEYS: { label: string; insert: string; aria: string }[] = [
  { label: "Tab", insert: "    ", aria: "들여쓰기 넣기" },
  { label: "(", insert: "(", aria: "여는 괄호" },
  { label: ")", insert: ")", aria: "닫는 괄호" },
  { label: ":", insert: ":", aria: "콜론" },
  { label: "'", insert: "'", aria: "작은따옴표" },
  { label: '"', insert: '"', aria: "큰따옴표" },
  { label: "=", insert: " = ", aria: "등호" },
  { label: "_", insert: "_", aria: "밑줄" },
];

export function KeyBar({ onKey }: { onKey: (text: string) => void }) {
  return (
    <div className="keybar" role="toolbar" aria-label="기호 입력 도우미">
      {HELPER_KEYS.map((k) => (
        <button
          key={k.label}
          type="button"
          aria-label={k.aria}
          // 누르는 순간 에디터 포커스를 뺏지 않게 해서 키보드가 내려가지 않아요
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => onKey(k.insert)}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}
