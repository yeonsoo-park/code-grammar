/**
 * Python 실행 워커 (Pyodide)
 * 화면과 다른 스레드에서 Python을 돌려서, 실행하는 동안에도 화면이 멈추지 않아요.
 * 무한 반복처럼 끝나지 않는 코드는 lib/runners/python.ts 가 이 워커를 통째로 종료해요.
 * 모듈 워커(type: "module")로 실행돼요. 예전 방식(importScripts)은 일부 브라우저에서 막혀요.
 */
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";

let pyodidePromise = null;
const loadedPackages = new Set();

function getPyodide() {
  if (!pyodidePromise) pyodidePromise = loadPyodide();
  return pyodidePromise;
}

async function ensurePackages(pyodide, packages) {
  const missing = (packages || []).filter((p) => !loadedPackages.has(p));
  if (missing.length) {
    await pyodide.loadPackage(missing);
    missing.forEach((p) => loadedPackages.add(p));
  }
}

function errorInfo(err) {
  const text = String((err && err.message) || err);
  // 트레이스백 마지막 줄: "TypeError: unsupported operand ..."
  const lines = text.trim().split("\n");
  const last = lines[lines.length - 1] || "";
  const m = last.match(/^(\w+(?:Error|Exception|Warning)?):\s?(.*)$/);
  // 사용자 코드의 줄 번호 (File "<exec>", line 3)
  let line = null;
  for (const l of lines) {
    const lm = l.match(/File "<exec>", line (\d+)/);
    if (lm) line = Number(lm[1]);
  }
  return { type: m ? m[1] : "Error", message: m ? m[2] : last, line, raw: text };
}

self.onmessage = async (event) => {
  const { id, type, code, checks, packages } = event.data;
  try {
    const pyodide = await getPyodide();
    if (type === "preload") {
      await ensurePackages(pyodide, packages);
      self.postMessage({ id, ok: true });
      return;
    }
    await ensurePackages(pyodide, packages);

    // 실행할 때마다 새 공간(namespace)을 만들어서, 이전 실행의 변수가 섞이지 않게 해요
    const ns = pyodide.globals.get("dict")();
    const out = [];
    pyodide.setStdout({ batched: (s) => out.push(s) });
    pyodide.setStderr({ batched: (s) => out.push(s) });

    let error = null;
    try {
      await pyodide.runPythonAsync(code, { globals: ns, filename: "<exec>" });
    } catch (err) {
      error = errorInfo(err);
    }
    const stdout = out.length ? out.join("\n") + "\n" : "";

    const results = [];
    if (!error && checks && checks.length) {
      ns.set("__output__", stdout);
      pyodide.setStdout({ batched: () => {} });
      for (const check of checks) {
        try {
          await pyodide.runPythonAsync(check, { globals: ns });
          results.push(true);
        } catch {
          results.push(false);
        }
      }
    }
    ns.destroy();
    self.postMessage({ id, ok: true, stdout, error, checks: results });
  } catch (err) {
    self.postMessage({ id, ok: false, loadError: String((err && err.message) || err) });
  }
};
