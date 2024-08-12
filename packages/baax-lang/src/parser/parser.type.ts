import * as Parsimmon from "parsimmon";
import { Node } from "./Node";
import { LangType } from "./parser";
import { sublang } from "./sublang";

type PrefixUnaryTypeOperator =
  // for numbers
  | "-"
  // to make readonly
  | "+";
export type PrefixUnaryTypeOperation = Node<{
  kind: "PrefixUnaryTypeOperation";
  operator: PrefixUnaryTypeOperator;
  value: NEXT_PARSER;
}>;

type BinaryTypeOperator = "|" | "&";
export type BinaryTypeOperation = Node<{
  kind: "BinaryTypeOperation";
  operator: BinaryTypeOperator;
  left: NEXT_PARSER;
  right: NEXT_PARSER;
}>;

export type OperatableTypeExpression =
  | LangType["NumberLiteral"]
  | LangType["TypeIdentifier"]
  | LangType["StringLiteral"]
  | LangType["BooleanLiteral"]
  | LangType["RecordDefinition"];

type NEXT_PARSER =
  | OperatableTypeExpression
  | PrefixUnaryTypeOperation
  | BinaryTypeOperation;

// Takes a parser for the prefix operator, and a parser for the base thing being
// parsed, and parses as many occurrences as possible of the prefix operator.
// Note that the parser is created using `Parsimmon.lazy` because it's recursive. It's
// valid for there to be zero occurrences of the prefix operator.
function PREFIX(
  operatorsParser: Parsimmon.Parser<OpLoc<PrefixUnaryTypeOperator>>,
  nextParser: Parsimmon.Parser<NEXT_PARSER>
): Parsimmon.Parser<NEXT_PARSER> {
  const parser = Parsimmon.lazy<NEXT_PARSER>(() => {
    const res: Parsimmon.Parser<NEXT_PARSER> = Parsimmon.seqMap(
      Parsimmon.index,
      operatorsParser,
      parser,
      Parsimmon.index,
      (start, operator, value, end) =>
        ({
          kind: "PrefixUnaryTypeOperation",
          operator: operator.op,
          value,
          "@": { start, end },
        } as const)
    ).or(nextParser);
    return res;
  });
  return parser;
}

type OpLoc<T extends string> = {
  op: T;
  start: Parsimmon.Index;
  end: Parsimmon.Index;
};

// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// left. (e.g. 1-2-3 is (1-2)-3 not 1-(2-3))
function BINARY_LEFT(
  operatorsParser: Parsimmon.Parser<OpLoc<BinaryTypeOperator>>,
  nextParser: Parsimmon.Parser<NEXT_PARSER>
) {
  // We run into a similar problem as with the `POSTFIX` parser above where we
  // can't recurse in the direction we want, so we have to resort to parsing an
  // entire list of operator chunks and then using `.reduce` to manually nest
  // them again.
  //
  // Example:
  //
  // INPUT  :: "1+2+3"
  // PARSE  :: [1, ["+", 2], ["+", 3]]
  // REDUCE :: ["+", ["+", 1, 2], 3]
  return Parsimmon.seqMap(
    nextParser,
    Parsimmon.seq(operatorsParser, nextParser).many(),
    (first, rest) => {
      return rest.reduce((acc, ch) => {
        const [op, another] = ch;
        return {
          kind: "BinaryTypeOperation",
          operator: op.op,
          left: acc,
          right: another,
          "@": {
            start: acc["@"].start,
            end: another["@"].end,
          },
        } as const;
      }, first);
    }
  );
}

export function OperatorParser(r: Parsimmon.TypedLanguage<LangType>) {
  // Operators should allow whitespace around them, but not require it. This
  // helper combines multiple operators together with names.
  //
  // Example: operators({Add: "+", Sub: "-"})
  //
  // Gives back an operator that parses either + or - surrounded by optional
  // whitespace, and gives back the word "Add" or "Sub" instead of the character.
  function operators<Ops extends readonly string[]>(
    ops: Ops
  ): Parsimmon.Parser<OpLoc<Ops[number]>> {
    const withWhitespace = ops.map((sym) =>
      Parsimmon.seqMap(
        Parsimmon.index,
        r._,
        Parsimmon.string(sym),
        r._,
        Parsimmon.index,
        (start, _0, op, _2, end) => {
          return { op, start, end };
        }
      )
    );
    const res = Parsimmon.alt(...withWhitespace);
    return res;
  }

  // A basic value is any parenthesized expression or a number.
  // TODO: start, end don't take the parens into consideration. Is that an issue?
  const Basic: Parsimmon.Parser<NEXT_PARSER> = Parsimmon.lazy<NEXT_PARSER>(() =>
    Parsimmon.string("(")
      .then(MyMath)
      .skip(Parsimmon.string(")"))
      .or(r.RecordDefinition)
      .or(r.NumberLiteral)
      .or(r.StringLiteral)
      .or(r.BooleanLiteral)
      .or(r.TypeIdentifier)
  );

  // Now we can describe the operators in order by precedence. You just need to
  // re-order the table.
  // const table = [
  //   { type: POSTFIX, ops: operators(["!"] as const) },
  //   { type: PREFIX, ops: operators(["-", "!"] as const) },
  //   { type: BINARY_RIGHT, ops: operators(["^"] as const) },
  //   {
  //     type: BINARY_LEFT,
  //     ops: operators(["*", "/"] as const),
  //   },
  //   {
  //     type: BINARY_LEFT,
  //     ops: operators(["+", "-"] as const),
  //   },
  // ];

  const table: Array<
    (next: Parsimmon.Parser<NEXT_PARSER>) => Parsimmon.Parser<NEXT_PARSER>
  > = [
    (next) => PREFIX(operators(["-", "+"] as const), next),
    (next) => BINARY_LEFT(operators(["&", "|"] as const), next),
  ];

  // Start off with Num as the base parser for numbers and thread that through the
  // entire table of operator parsers.
  const tableParser = table.reduce((next, level) => level(next), Basic);

  // The above is equivalent to:
  //
  // TYPE(operators({...}),
  //   TYPE(operators({...}),
  //     TYPE(operators({...})),
  //       TYPE(operators({...}),
  //         TYPE(operators({...}), ...))))
  //
  // But it's easier if to see what's going on and reorder the precedence if we
  // keep it in a table instead of nesting it all manually.

  // This is our version of a math expression.
  const MyMath = tableParser.trim(r._);
  return MyMath;
}

export type LangType_Type = {
  TypeExpression:
    | OperatableTypeExpression
    | PrefixUnaryTypeOperation
    | BinaryTypeOperation;

  // :string
  TypeTag: Node<{
    kind: "TypeTag";
    optional: boolean;
    typeExpression: LangType["TypeExpression"];
  }>;
};

/**
 * Defines type expressions and operations
 */
export const LangDef_Type = sublang<LangType, LangType_Type>({
  TypeExpression: OperatorParser,

  // :string
  TypeTag: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.index,
      Parsimmon.alt(Parsimmon.string("?:"), Parsimmon.string(":")),
      r._,
      r.TypeExpression,
      Parsimmon.index,
      (start, tagger, _3, typeExpression, end) => {
        const optional = tagger === "?:";
        return {
          kind: "TypeTag",
          optional,
          typeExpression,
          "@": { start, end },
        };
      }
    );
  },
});
