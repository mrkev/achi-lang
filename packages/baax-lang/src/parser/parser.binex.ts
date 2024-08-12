import * as Parsimmon from "parsimmon";
import { LangType } from "./parser";
import { Node, withAt } from "./Node";

type PrefixUnaryOperator = "-" | "!";
export type PrefixUnaryOperation = Node<{
  kind: "PrefixUnaryOperation";
  operator: PrefixUnaryOperator;
  value: NEXT_PARSER;
}>;

type SuffixUnaryOperator = "!";
export type SuffixUnaryOperation = Node<{
  kind: "SuffixUnaryOperation";
  operator: SuffixUnaryOperator;
  value: NEXT_PARSER;
}>;

type BinaryOperator =
  // String + Numerial
  | "+"
  // Numerical
  | "-"
  | "*"
  | "/"
  | "^"
  // Boolean
  | "&&"
  | "||"
  // Comparison
  | ">"
  | "<"
  | ">="
  | "<="
  | "=="
  | "!=";

export type BinaryOperation = Node<{
  kind: "BinaryOperation";
  operator: BinaryOperator;
  left: NEXT_PARSER;
  right: NEXT_PARSER;
}>;

export type OperatableExpression =
  | LangType["NumberLiteral"]
  | LangType["ValueIdentifier"]
  | LangType["StringLiteral"]
  | LangType["BooleanLiteral"]
  | LangType["FunctionCall"]
  | LangType["NullLiteral"];

// This parser supports basic math with + - * / ^, unary negation, factorial,
// and parentheses. It does not evaluate the math, just turn it into a series of
// nested lists that are easy to evaluate.

// You might think that parsing math would be easy since people learn it early
// in school, but dealing with precedence and associativity of operators is
// actually one of the hardest and most tedious things you can do in a parser!
// If you look at a language like JavaScript, it has even more operators than
// math, like = and && and || and ++ and so many more...

///////////////////////////////////////////////////////////////////////

type NEXT_PARSER =
  | OperatableExpression
  | PrefixUnaryOperation
  | SuffixUnaryOperation
  | BinaryOperation;

// Takes a parser for the prefix operator, and a parser for the base thing being
// parsed, and parses as many occurrences as possible of the prefix operator.
// Note that the parser is created using `Parsimmon.lazy` because it's recursive. It's
// valid for there to be zero occurrences of the prefix operator.
function PREFIX(
  operatorsParser: Parsimmon.Parser<OpLoc<PrefixUnaryOperator>>,
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
          kind: "PrefixUnaryOperation",
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

// Ideally this function would be just like `PREFIX` but reordered like
// `Parsimmon.seq(parser, operatorsParser).or(nextParser)`, but that doesn't work. The
// reason for that is that Parsimmon will get stuck in infinite recursion, since
// the very first rule. Inside `parser` is to match parser again. Alternatively,
// you might think to try `nextParser.or(Parsimmon.seq(parser, operatorsParser))`, but
// that won't work either because in a call to `.or` (aka `Parsimmon.alt`), Parsimmon
// takes the first possible match, even if subsequent matches are longer, so the
// parser will never actually look far enough ahead to see the postfix
// operators.
function POSTFIX(
  operatorsParser: Parsimmon.Parser<OpLoc<"!">>,
  nextParser: Parsimmon.Parser<NEXT_PARSER>
) {
  // Because we can't use recursion like stated above, we just match a flat list
  // of as many occurrences of the postfix operator as possible, then use
  // `.reduce` to manually nest the list.
  //
  // Example:
  //
  // INPUT  :: "4!!!"
  // PARSE  :: [4, "factorial", "factorial", "factorial"]
  // REDUCE :: ["factorial", ["factorial", ["factorial", 4]]]
  return Parsimmon.seqMap(nextParser, operatorsParser.many(), (x, suffixes) =>
    suffixes.reduce((acc, { op, end }) => {
      return {
        kind: "SuffixUnaryOperation",
        operator: op,
        value: acc,
        "@": {
          start: acc["@"].start,
          end,
        },
      } as const;
    }, x)
  );
}

// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// right. (e.g. 1^2^3 is 1^(2^3) not (1^2)^3)
function BINARY_RIGHT(
  operatorsParser: Parsimmon.Parser<OpLoc<BinaryOperator>>,
  nextParser: Parsimmon.Parser<NEXT_PARSER>
): Parsimmon.Parser<NEXT_PARSER> {
  const parser = Parsimmon.lazy<NEXT_PARSER>(() => {
    const chainRes: Parsimmon.Parser<NEXT_PARSER> = nextParser.chain((next) =>
      withAt(
        Parsimmon.seqMap(
          operatorsParser,
          Parsimmon.of(next),
          parser,
          (operator, next, p) =>
            ({
              kind: "BinaryOperation",
              operator: operator.op,
              left: next,
              right: p,
            } as const)
        )
      ).or(Parsimmon.of(next))
    );

    return chainRes;
  });
  return parser;
}

// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// left. (e.g. 1-2-3 is (1-2)-3 not 1-(2-3))
function BINARY_LEFT(
  operatorsParser: Parsimmon.Parser<OpLoc<BinaryOperator>>,
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
          kind: "BinaryOperation",
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
      .or(r.NumberLiteral)
      .or(r.StringLiteral)
      .or(r.BooleanLiteral)
      .or(r.FunctionCall)
      .or(r.NullLiteral)
      .or(r.ValueIdentifier)
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
    (next) => BINARY_LEFT(operators(["==", "!="] as const), next),
    (next) => POSTFIX(operators(["!"] as const), next),
    (next) => PREFIX(operators(["-", "!"] as const), next),
    (next) => BINARY_RIGHT(operators(["^"] as const), next),
    (next) => BINARY_LEFT(operators(["*", "/"] as const), next),
    (next) => BINARY_LEFT(operators(["+", "-"] as const), next),
    (next) => BINARY_LEFT(operators(["&&"] as const), next),
    (next) => BINARY_LEFT(operators(["||"] as const), next),
    (next) => BINARY_LEFT(operators([">=", "<=", ">", "<"] as const), next),
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
