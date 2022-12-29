import * as Parsimmon from "parsimmon";
import { LangType } from "./parser";

/** ExhaustiveParsers helpers, to ensure `Parsimmon.alt`s are exhaustive */

/** Keys of all the parsers in the LangType that don't produce a "node" */
type LT_NonNodeKey = {
  [Key in keyof LangType]: LangType[Key] extends
    | string
    | number
    | symbol
    | string[]
    ? Key
    : never;
}[keyof LangType];
// LangType, but skipping any entry that isn't an object
type LT_OnlyNodes = Omit<LangType, LT_NonNodeKey>;
type ValueOf<T> = T[keyof T];
// example:
//   ExhaustiveParsers<LangType["Statement"]>
// can only be satisfied by an object that entries for all the types
// that make up LangType["Statement"]. Each entry maps to a Parsimmon.Parser.
export type ExhaustiveParsers<T extends ValueOf<LT_OnlyNodes>> = {
  [key in T["kind"]]: Parsimmon.Parser<LangType[key]>;
};

/** Sublang helpers, to split LangType into multiple files */

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
