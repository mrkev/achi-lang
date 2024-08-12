import { LangType } from "../../../baax-lang/src/parser/parser";
import { COMPACT_AST } from "./App";

const replacer = (key: string, value: any) => {
  if (key === "@") {
    return `${value.start.line}:${value.start.column}:${value.end.line}:${value.end.column}`;
  } else {
    return value;
  }
};
export function transformASTForDisplay(ast: LangType["Program"]) {
  const strvalue = JSON.stringify(ast, COMPACT_AST ? replacer : undefined, 2);
  return strvalue;
}
