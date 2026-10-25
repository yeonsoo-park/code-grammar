/**
 * Python 에러를 초보자 눈높이의 한국어로 바꿔요.
 * 원문 에러는 화면에서 접어 두고, 이 설명을 먼저 보여줘요.
 */
import type { PyError } from "./runners/python";

export type FriendlyError = { title: string; detail: string; tip: string };

export function explainError(e: PyError): FriendlyError {
  const where = e.line ? `${e.line}번째 줄에서 ` : "";
  const m = e.message;

  switch (e.type) {
    case "NameError": {
      const name = m.match(/name '(\w+)' is not defined/)?.[1];
      return {
        title: `${where}모르는 이름이 나왔어요`,
        detail: name ? `\`${name}\`이라는 변수를 아직 만들지 않았어요.` : "아직 만들지 않은 변수를 썼어요.",
        tip: "철자가 맞는지, 그 변수를 위에서 먼저 만들었는지 확인해 보세요. 문자열이라면 따옴표가 필요해요.",
      };
    }
    case "TypeError":
      if (/can only concatenate str|unsupported operand type\(s\)|must be str, not/.test(m)) {
        return {
          title: `${where}자료형이 맞지 않아요`,
          detail: "글자(str)와 숫자(int·float)를 바로 계산하거나 이으려고 했어요.",
          tip: "계산하려면 `int()`로 숫자로, 글자와 이으려면 `str()`로 바꿔 보세요.",
        };
      }
      if (/not callable/.test(m)) {
        return { title: `${where}함수가 아닌 것을 함수처럼 불렀어요`, detail: "이름 뒤에 괄호 `()`를 붙였는데, 그 이름은 함수가 아니에요.", tip: "변수 이름을 `print`나 `int`처럼 함수 이름과 같게 짓지 않았는지 확인해 보세요." };
      }
      return { title: `${where}자료형이 맞지 않아요`, detail: "이 값으로는 할 수 없는 동작을 했어요.", tip: "`type()`으로 값의 자료형을 출력해 보면 원인을 찾기 쉬워요." };
    case "SyntaxError":
      return {
        title: `${where}문법이 맞지 않아요`,
        detail: /unterminated string/.test(m)
          ? "따옴표를 열고 닫지 않았어요."
          : /'\(' was never closed|was never closed/.test(m)
            ? "괄호를 열고 닫지 않았어요."
            : /invalid decimal literal|invalid syntax/.test(m)
              ? "Python이 읽을 수 없는 문장이 있어요. 숫자에 쉼표(,)를 넣었거나, 기호가 빠졌을 수 있어요."
              : "Python 문법에 맞지 않는 부분이 있어요.",
        tip: "따옴표·괄호 짝, 숫자 안의 쉼표, `=`와 `==`를 확인해 보세요.",
      };
    case "IndentationError":
      return { title: `${where}들여쓰기가 맞지 않아요`, detail: "줄 맨 앞의 빈칸이 필요 없는 곳에 있거나, 필요한 곳에 없어요.", tip: "지금 배우는 코드는 모든 줄을 맨 앞에서 시작하면 돼요." };
    case "ValueError":
      return { title: `${where}바꿀 수 없는 값이에요`, detail: "`int(\"3.5\")`나 `int(\"삼\")`처럼 숫자로 바꿀 수 없는 글자를 바꾸려고 했어요.", tip: "바꾸려는 글자가 정말 숫자 모양인지 확인해 보세요." };
    case "ZeroDivisionError":
      return { title: `${where}0으로 나눴어요`, detail: "어떤 수도 0으로 나눌 수 없어요.", tip: "나누는 값이 0이 될 수 있는지 확인해 보세요." };
    case "AttributeError":
      return { title: `${where}없는 기능을 불렀어요`, detail: "이 자료형에는 그런 이름의 기능(메서드)이 없어요.", tip: "점(.) 뒤의 이름 철자와 값의 자료형을 확인해 보세요." };
    case "KeyError":
      return { title: `${where}없는 키를 찾았어요`, detail: "딕셔너리에 그 이름의 키가 없어요.", tip: "키 이름의 철자와 대소문자를 확인해 보세요." };
    case "IndexError":
      return { title: `${where}범위를 벗어났어요`, detail: "목록에 없는 위치의 값을 꺼내려고 했어요.", tip: "위치 번호는 0부터 시작해요." };
    default:
      return { title: `${where}코드를 실행하다 문제가 생겼어요`, detail: "아래 원문 메시지에 자세한 내용이 있어요.", tip: "마지막 줄의 에러 이름을 검색해 보면 도움이 돼요." };
  }
}
