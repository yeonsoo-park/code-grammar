/**
 * 아주 작은 코드 하이라이터 (Python·SQL)
 * 외부 테마를 쓰면 파란 키워드가 섞이기 쉬워서, 토큰 색은 tokens.css 의 --code-* 만 쓰도록 직접 만들었어요.
 */

export type TokenType = "keyword" | "builtin" | "string" | "number" | "comment" | "plain";
export type Token = { type: TokenType; text: string };

const PY_KEYWORDS = new Set(
  "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "),
);
const PY_BUILTINS = new Set("print type int float str bool len range list dict set tuple sum min max round sorted abs enumerate zip".split(" "));
const SQL_KEYWORDS = new Set(
  "select from where and or not in is null as join left right inner outer full on group by order having limit offset distinct case when then else end with over partition count sum avg min max union all insert update delete create table values asc desc between like exists".split(" "),
);

const PY_RE = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/gm;
const SQL_RE = /(--.*$)|('(?:''|[^'])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/gm;

export function tokenizeLine(line: string, lang: "python" | "sql"): Token[] {
  const re = new RegExp(lang === "python" ? PY_RE : SQL_RE);
  const tokens: Token[] = [];
  let last = 0;
  for (const m of line.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) tokens.push({ type: "plain", text: line.slice(last, idx) });
    const [text, comment, string, number, word] = m;
    let type: TokenType = "plain";
    if (comment) type = "comment";
    else if (string) type = "string";
    else if (number) type = "number";
    else if (word) {
      if (lang === "python") type = PY_KEYWORDS.has(word) ? "keyword" : PY_BUILTINS.has(word) ? "builtin" : "plain";
      else type = SQL_KEYWORDS.has(word.toLowerCase()) ? "keyword" : "plain";
    }
    tokens.push({ type, text });
    last = idx + text.length;
  }
  if (last < line.length) tokens.push({ type: "plain", text: line.slice(last) });
  return tokens;
}
