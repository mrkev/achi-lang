import * as Parsimmon from "parsimmon";
import { LangType } from "./parser";
import { MathParser, NEXT_PARSER } from "./parser.binex";
import { sublang } from "./sublang";

// expression =
//     term
//     | expression "+" term
//     | expression "-" term .
// term =
//     factor
//     | term "*" factor
//     | term "/" factor .
// factor =
//     number
//     | "(" expression ")" .

export type BinaryExpression = {
  kind: "BinaryExpression";
  operator: string;
  left: LangType["Expression"];
  right: LangType["Expression"];
};

export type LangType_BinOp = {
  // BinaryOperator: string;
  // BinaryOperation: {
  //   kind: "BinaryOperation";
  //   operator: string;
  //   left: LangType["Expression"];
  //   right: LangType["Expression"];
  // };

  // BinaryExpression_Expr
  // BinaryExpression: BinaryExpression | LangType["Expression"];
  // BinaryExpression_Term: BinaryExpression | LangType["Expression"];
  // BinaryExpression_Factor: BinaryExpression | LangType["Expression"];
  OperatorExpression: NEXT_PARSER;
};

/**
 * Defines binary operations
 */
export const LangDef_BinOp = sublang<LangType, LangType_BinOp>({
  OperatorExpression: MathParser,

  // BinaryExpression: (r) => {
  //   return Parsimmon.alt(
  //     r.BinaryExpression_Term,
  //     Parsimmon.seqMap(
  //       r.BinaryExpression,
  //       r._,
  //       Parsimmon.regex(/(\+|\-)/),
  //       r._,
  //       r.BinaryExpression_Term,
  //       (expr, _1, op, _3, term): LangType["BinaryExpression"] => {
  //         return {
  //           kind: "BinaryExpression",
  //           left: expr,
  //           operator: op,
  //           right: term,
  //         };
  //       }
  //     )
  //   );
  // },

  // // // term =
  // //     factor
  // //     | term "*" factor
  // //     | term "/" factor .
  // BinaryExpression_Term: (r) => {
  //   return Parsimmon.alt(
  //     r.BinaryExpression_Factor,
  //     Parsimmon.seqMap(
  //       r.BinaryExpression_Term,
  //       r._,
  //       Parsimmon.regex(/(\*|\/)/),
  //       r._,
  //       r.BinaryExpression_Factor,
  //       (term, _1, op, _3, factor): LangType["BinaryExpression_Term"] => {
  //         return {
  //           kind: "BinaryExpression",
  //           left: term,
  //           operator: op,
  //           right: factor,
  //         };
  //       }
  //     )
  //   );
  // },

  // BinaryExpression_Factor: (r) => {
  //   return Parsimmon.seqMap(
  //     Parsimmon.string("<<"),
  //     r._,
  //     r.BinaryExpression,
  //     r._,
  //     Parsimmon.string(">>"),
  //     (_0, _1, expr, _3, _4) => {
  //       return expr;
  //     }
  //   ).or(r.NumberLiteral);
  // },

  // Arithmetic: + - / * %
  // Comparison: all double << >> == !=
  // Logic: || &&
  // Todo, bitwise?
  // BinaryOperator: () => {
  //   return Parsimmon.regex(/(\+|\-|\/|\*|\%|\=\=|\!\=|\>\>|\<\<|\|\||\&\&)/);
  // },

  // 3 + 3
  // BinaryOperation: (r) => {
  //   return Parsimmon.seqMap(
  //     r.Expression,
  //     r._,
  //     r.BinaryOperator,
  //     r._,
  //     r.Expression,
  //     (left, _0, operator, _1, right) => {
  //       return {
  //         kind: "BinaryOperation",
  //         operator,
  //         left,
  //         right,
  //       };
  //     }
  //   );
  // },
});

// Factor
// = "(" _ expr:Expression _ ")" { return expr; }
// / Integer
