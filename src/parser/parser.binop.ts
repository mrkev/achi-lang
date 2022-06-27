import * as Parsimmon from "parsimmon";
import { LangType } from "./parser";

type SublangTypedRule<TLanguageSpec, TSubLangSpec> = {
  [P in keyof TSubLangSpec]: (
    r: Parsimmon.TypedLanguage<TLanguageSpec>
  ) => Parsimmon.Parser<TSubLangSpec[P]>;
};

export function sublang<TLanguageSpec, TSubLangSpec>(
  rules: SublangTypedRule<TLanguageSpec, TSubLangSpec>
): SublangTypedRule<TLanguageSpec, TSubLangSpec> {
  return rules;
}

export type LangType_BinOp = {
  BinaryOperator: string;
  BinaryOperation: {
    kind: "BinaryOperation";
    operator: string;
    left: LangType["Expression"];
    right: LangType["Expression"];
  };
};

export const LangDef_BinOp = sublang<LangType, LangType_BinOp>({
  // Arithmetic: + - / * %
  // Comparison: all double << >> == !=
  // Logic: || &&
  // Todo, bitwise?
  BinaryOperator: () => {
    return Parsimmon.regex(/(\+|\-|\/|\*|\%|\=\=|\!\=|\>\>|\<\<|\|\||\&\&)/);
  },

  // 3 + 3
  BinaryOperation: (r) => {
    return Parsimmon.seqMap(
      r.Expression,
      r._,
      r.BinaryOperator,
      r._,
      r.Expression,
      (left, _0, operator, _1, right) => {
        return {
          kind: "BinaryOperation",
          operator,
          left,
          right,
        };
      }
    );
  },
});
