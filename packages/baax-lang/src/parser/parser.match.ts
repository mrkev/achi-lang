import * as Parsimmon from "parsimmon";
import { LangType } from "./parser";
import { sublang, SublangTypedRule } from "./sublang";
import { Node, withAt } from "./Node";

export type LangType_Match = {
  CaseEntry: Node<{
    kind: "CaseEntry";
    guard: LangType["Expression"];
    block: LangType["Block"];
  }>;

  MatchFunction: Node<{
    kind: "MatchFunction";
    identifier: LangType["ValueIdentifier"];
    matchType: LangType["TypeExpression"];
    block: LangType["BlockOfCases"];
  }>;

  MatchExpression: Node<{
    kind: "MatchExpression";
    expression: LangType["Expression"];
    block: LangType["BlockOfCases"];
  }>;

  BlockOfCases: Node<{
    kind: "BlockOfCases";
    caseEntries: Array<LangType["CaseEntry"]>;
  }>;
};

/**
 * Defines binary operations
 */
export const LangDef_Match: SublangTypedRule<LangType, LangType_Match> =
  sublang<LangType, LangType_Match>({
    // case (card: King(value)): { ... }
    CaseEntry: (r) => {
      return withAt(
        Parsimmon.seqMap(
          Parsimmon.string("case"),
          r.__,
          r.Expression,
          r._,
          Parsimmon.string(":"),
          r.__,
          r.Block,
          function (_0, _1, expression, _3, _4, _5, block) {
            return {
              kind: "CaseEntry",
              guard: expression,
              block,
            };
          }
        )
      );
    },

    // function foo matches Type {}
    MatchFunction: (r) => {
      return withAt(
        Parsimmon.seqMap(
          Parsimmon.string("function"),
          r.__,
          r.ValueIdentifier,
          r.__,
          Parsimmon.string("matches"),
          r.__,
          r.TypeExpression,
          r._,
          r.BlockOfCases,
          function (_0, _1, identifier, _3, _4, _5, type, _7, block) {
            return {
              kind: "MatchFunction",
              identifier,
              matchType: type,
              block,
            };
          }
        )
      );
    },

    // match (card) { case King(): ... }
    MatchExpression: (r) => {
      return withAt(
        Parsimmon.seqMap(
          Parsimmon.string("match"),
          r._,
          Parsimmon.string("("),
          r._,
          r.Expression,
          r._,
          Parsimmon.string(")"),
          r._,
          r.BlockOfCases,
          function (_0, _1, _2, _3, expression, _5, _6, _7, block) {
            return {
              kind: "MatchExpression",
              expression,
              block,
            };
          }
        )
      );
    },

    BlockOfCases: (r) => {
      const caseListParser = Parsimmon.sepBy(r.CaseEntry, r.__nl).trim(r._nl);
      return withAt(
        Parsimmon.string("{")
          // TBD: sepBy1 and make a different parser for Unit?
          .then(caseListParser)
          .skip(Parsimmon.string("}"))
          .map((caseEntries) => {
            return {
              kind: "BlockOfCases",
              caseEntries,
            };
          })
      );
    },
  });
