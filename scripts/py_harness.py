"""
verify-content.ts 가 쓰는 Python 실행기.
stdin 으로 {"code": ..., "checks": [...]} 를 받아 실행하고, 결과를 JSON 으로 돌려줘요.
브라우저(Pyodide)에서 채점하는 방식과 똑같이 동작해요.
"""

import contextlib
import io
import json
import sys
import traceback

req = json.load(sys.stdin)
ns: dict = {"__name__": "__main__"}
out = io.StringIO()
error = None
try:
    with contextlib.redirect_stdout(out):
        exec(compile(req["code"], "<code>", "exec"), ns)
except Exception as e:  # noqa: BLE001
    error = {"type": type(e).__name__, "message": str(e), "trace": traceback.format_exc()}

checks = []
if error is None:
    ns["__output__"] = out.getvalue()
    for check in req.get("checks", []):
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(compile(check, "<check>", "exec"), ns)
            checks.append(True)
        except Exception:  # noqa: BLE001
            checks.append(False)

json.dump({"stdout": out.getvalue(), "error": error, "checks": checks}, sys.stdout, ensure_ascii=False)
