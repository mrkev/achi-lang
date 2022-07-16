import * as Parsimmon from "parsimmon";

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
