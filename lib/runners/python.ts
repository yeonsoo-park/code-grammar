"use client";

/**
 * 화면 쪽에서 Python 워커를 다루는 창구.
 * - preloadPython(): 미리 내려받기 시작 (처음 한 번은 몇 초 걸려요)
 * - runPython(): 코드 실행 + 채점 기준(checks) 실행
 * 10초 안에 끝나지 않으면 워커를 종료하고 새로 만들어요 (무한 반복 대비).
 */

export type PyError = { type: string; message: string; line: number | null; raw: string };
export type PyResult = { stdout: string; error: PyError | null; checks: boolean[] };

export type PyStatus = "idle" | "loading" | "ready" | "failed";

const TIMEOUT_MS = 10_000;

let worker: Worker | null = null;
let warm = false;
let seq = 0;
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
let status: PyStatus = "idle";
const statusListeners = new Set<(s: PyStatus) => void>();

function setStatus(s: PyStatus) {
  status = s;
  statusListeners.forEach((l) => l(s));
}

export function getPyStatus() {
  return status;
}
export function onPyStatus(l: (s: PyStatus) => void) {
  statusListeners.add(l);
  return () => statusListeners.delete(l);
}

export class PythonLoadError extends Error {}
export class PythonTimeoutError extends Error {}

function getWorker() {
  if (worker) return worker;
  worker = new Worker("/workers/pyodide-worker.js", { type: "module" });
  worker.onmessage = (e: MessageEvent) => {
    const { id, ok, loadError, ...rest } = e.data;
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    if (ok) {
      if (status !== "ready") setStatus("ready");
      p.resolve(rest);
    } else {
      setStatus("failed");
      p.reject(new PythonLoadError(loadError));
    }
  };
  worker.onerror = () => {
    setStatus("failed");
    pending.forEach((p) => p.reject(new PythonLoadError("worker error")));
    pending.clear();
    worker = null;
    warm = false;
  };
  return worker;
}

function restartWorker() {
  worker?.terminate();
  worker = null;
  warm = false;
  pending.forEach((p) => p.reject(new PythonTimeoutError("timeout")));
  pending.clear();
  setStatus("idle");
}

function call<T>(msg: Record<string, unknown>, timeout?: number): Promise<T> {
  const id = ++seq;
  const w = getWorker();
  if (status === "idle" || status === "failed") setStatus("loading");
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    w.postMessage({ id, ...msg });
    if (timeout) {
      setTimeout(() => {
        if (pending.has(id)) restartWorker();
      }, timeout);
    }
  });
}

export function preloadPython(packages: string[] = []) {
  if (status === "ready" || status === "loading") return;
  call({ type: "preload", packages }).catch(() => {});
}

export async function runPython(code: string, checks: string[] = [], packages: string[] = []): Promise<PyResult> {
  // 처음 실행은 내려받는 시간이 있어서 시간 제한을 길게 둬요
  if (!warm) {
    await call({ type: "preload", packages });
    warm = true;
  }
  return call<PyResult>({ type: "run", code, checks, packages }, TIMEOUT_MS);
}
