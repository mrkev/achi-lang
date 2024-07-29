import * as Parsimmon from "parsimmon";
import { ExhaustiveParsers } from "./sublang";
import { LangType_BinOp, LangDef_BinOp } from "./parser.operations";
import { LangDef_Function, LangType_Function } from "./parser.function";
import { LangType_Match, LangDef_Match } from "./parser.match";
import { Node, withAt } from "./Node";
import { LangDef_Type, LangType_Type } from "./parser.type";

export type LangType = LangType_BinOp &
  LangType_Match &
  LangType_Function &
  LangType_Type & {
    _: string[];
    __: string;
    _comma: string;
    _nl: string;
    __nl: string;
    blockComment: string;

    // Expressions
    ValueIdentifier: Node<{ kind: "ValueIdentifier"; value: string }>;
    TypeIdentifier: Node<{ kind: "TypeIdentifier"; value: string }>;
    NumberLiteral: Node<{ kind: "NumberLiteral"; value: number }>;
    StringLiteral: Node<{ kind: "StringLiteral"; value: string }>;
    BooleanLiteral: Node<{ kind: "BooleanLiteral"; value: boolean }>;
    NullLiteral: Node<{ kind: "NullLiteral"; value: null }>;

    // Card.Number
    NestedTypeIdentifier: Node<{
      kind: "NestedTypeIdentifier";
      path: Array<LangType["TypeIdentifier"]>;
    }>;

    // return 3
    ReturnStatement: Node<{
      kind: "ReturnStatement";
      expression: LangType["Expression"];
    }>;

    // if (x < 3) {}
    IfStatement: Node<{
      kind: "IfStatement";
      guard: LangType["Expression"];
      block: LangType["Block"];
      elseCase: LangType["Block"] | LangType["IfStatement"] | null;
    }>;

    Expression:
      | LangType["BooleanLiteral"]
      | LangType["NullLiteral"]
      // | LangType["FunctionDefinition"]
      | LangType["MatchExpression"]
      | LangType["NumberLiteral"]
      | LangType["NamedRecordLiteral"]
      | LangType["FunctionCall"]
      | LangType["ValueIdentifier"]
      | LangType["RecordLiteral"]
      | LangType["StringLiteral"]
      | LangType["ListLiteral"]
      | LangType["MapLiteral"]
      | LangType["AnonymousFunctionLiteral"]
      | LangType["OperationExpression"];
    // | BinaryExpression;

    ConstantDefinition: Node<{
      kind: "ConstantDefinition";
      identifier: LangType["ValueIdentifier"];
      expression: LangType["Expression"];
    }>;

    // Records

    // Point(x: number, y: number)
    NamedRecordDefinition: Node<{
      kind: "NamedRecordDefinition";
      identifier: LangType["TypeIdentifier"];
      record: LangType["RecordDefinition"];
    }>;

    // class Point(x: number, y: number)
    NamedRecordDefinitionStatement: Node<{
      kind: "NamedRecordDefinitionStatement";
      namedRecordDefinition: LangType["NamedRecordDefinition"];
    }>;

    // classes Card { King(); Queen(); Jack(); Number(value: number) }
    NamedRecordDefinitionGroup: Node<{
      kind: "NamedRecordDefinitionGroup";
      identifier: LangType["TypeIdentifier"];
      namedRecordDefinitions: Array<LangType["NamedRecordDefinition"]>;
    }>;

    // Point(x: 5, y: 3)
    NamedRecordLiteral: Node<{
      kind: "NamedRecordLiteral";
      identifier: LangType["TypeIdentifier"] | LangType["NestedTypeIdentifier"];
      recordLiteral: LangType["RecordLiteral"];
    }>;

    //* (x: 5, y: 5)
    RecordLiteral: Node<{
      kind: "RecordLiteral";
      definitions: Array<LangType["NamedLiteral"]>;
    }>;

    //* (x: number, y: number)
    RecordDefinition: Node<{
      kind: "RecordDefinition";
      definitions: Array<LangType["NamedDefinition"]>;
    }>;

    // x: 5
    NamedLiteral: Node<{
      kind: "NamedLiteral";
      identifier: LangType["ValueIdentifier"];
      expression: LangType["Expression"];
    }>;

    // x: number
    NamedDefinition: Node<{
      kind: "NamedDefinition";
      identifier: LangType["ValueIdentifier"];
      typeTag: LangType["TypeTag"];
    }>;

    // #log value
    DEBUG_Log: Node<{
      kind: "DEBUG_Log";
      expression: LangType["Expression"];
    }>;

    // #log Type
    DEBUG_LogType: Node<{
      kind: "DEBUG_LogType";
      typeExpression: LangType["TypeExpression"];
    }>;

    Statement:
      | LangType["ReturnStatement"]
      | LangType["IfStatement"]
      | LangType["MatchExpression"]
      | LangType["NamedRecordDefinitionStatement"]
      | LangType["NamedRecordDefinitionGroup"]
      | LangType["ConstantDefinition"]
      | LangType["MatchFunction"]
      | LangType["FunctionCall"]
      | LangType["DEBUG_LogType"]
      | LangType["DEBUG_Log"];

    Program: Node<{
      kind: "Program";
      statements: Array<LangType["Statement"]>;
    }>;

    StatementList: Node<{
      kind: "StatementList";
      statements: Array<LangType["Statement"]>;
    }>;
    Block: Node<{ kind: "Block"; statements: Array<LangType["Statement"]> }>;

    ListLiteral: Node<{
      kind: "ListLiteral";
      expressions: Array<LangType["Expression"]>;
    }>;

    MapLiteral: Node<{
      kind: "MapLiteral";
      entries: Array<LangType["NamedLiteral"]>;
    }>;

    // TupleDefinition: any;
    // NamedTupleDefinition: any;
  };

export const Lang = Parsimmon.createLanguage<LangType>({
  _: (r) => {
    return Parsimmon.alt(r.blockComment, Parsimmon.whitespace)
      .many()
      .desc("optional space");
  },
  __: () => {
    return Parsimmon.whitespace.desc("required whitespace");
  },
  _comma: (r) => {
    return Parsimmon.string(",").trim(r._).desc("comma");
  },
  _nl: (r) => {
    return Parsimmon.regex(/[\s;]*/)
      .trim(r._)
      .desc("optional newline");
  },
  __nl: (r) => {
    return Parsimmon.alt(Parsimmon.string(";"), Parsimmon.string("\n"))
      .trim(r._)
      .desc("requried newline");
  },

  // /* ... */
  blockComment: () => {
    return Parsimmon.regex(/\/\*[\s\S]*\*\//).desc("block comment");
  },

  ////////////////////////////////////////////////////////////// Expressions ///

  NumberLiteral: () => {
    return Parsimmon.seqMap(
      Parsimmon.index,
      Parsimmon.regexp(/[0-9]+/),
      Parsimmon.index,
      (start, v, end) => ({
        kind: "NumberLiteral",
        value: Number(v),
        "@": { start, end },
      })
    );
  },

  // Regexp based parsers should generally be named for better error reporting.
  StringLiteral: () =>
    withAt(
      token(Parsimmon.regexp(/"((?:\\.|.)*?)"/, 1))
        .map(interpretEscapes)
        .map(
          (str) =>
            ({
              kind: "StringLiteral",
              value: str,
            } as const)
        )
        .desc("string")
    ),

  BooleanLiteral: () => {
    return withAt(
      Parsimmon.regexp(/true|false/).map((str) => ({
        kind: "BooleanLiteral",
        value: str === "true",
      }))
    );
  },

  NullLiteral: () => {
    return withAt(
      Parsimmon.regexp(/null/).map(() => ({
        kind: "NullLiteral",
        value: null,
      }))
    );
  },

  ...LangDef_BinOp,
  ...LangDef_Type,

  // Card, Point, SomeDataStructure, number
  TypeIdentifier: () => {
    return Parsimmon.regexp(/string|number|boolean|object|array|[A-Z][a-zA-Z]*/)
      .mark()
      .map(({ start, end, value }) => ({
        kind: "TypeIdentifier",
        value,
        "@": { start, end },
      }));
  },

  // TODO: test
  NestedTypeIdentifier: (r) => {
    return withAt(
      Parsimmon.sepBy1(r.TypeIdentifier, Parsimmon.string(".")).map((path) => {
        return {
          kind: "NestedTypeIdentifier",
          path,
        };
      })
    );
  },

  // card, point, doThisOrThat
  ValueIdentifier: () => {
    return Parsimmon.regexp(
      /(?!string|number|boolean|object|array|true|false|null)[a-z][a-zA-Z0-9]*/
    )
      .mark()
      .map(({ start, end, value }) => ({
        kind: "ValueIdentifier",
        value: value,
        "@": { start, end },
      }));
  },

  // [2,3,4]
  ListLiteral: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("["),
        r._,
        r.Expression.sepBy(r._comma.trim(r._)),
        Parsimmon.string("]").trim(r._),
        function (_0, _1, expressions, _2) {
          return {
            kind: "ListLiteral",
            expressions,
          };
        }
      )
    );
  },

  //* {x: 5, y: 5}, basically the same as RecordLiteral
  MapLiteral: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("{"),
        r._,
        Parsimmon.sepBy(r.NamedLiteral, r._comma),
        r._,
        Parsimmon.string("}"),
        (_0, _1, entries, _3, _4) => {
          return {
            kind: "MapLiteral",
            entries,
          };
        }
      )
    );
  },

  Expression: (r) => {
    // AnonFunction before Record so
    // const x = () => ... doesn't fail
    const expressionParsers: ExhaustiveParsers<LangType["Expression"]> & {
      OperationExpression: Parsimmon.Parser<LangType["OperationExpression"]>;
    } = {
      // FunctionDefinition: r.FunctionDefinition,
      MatchExpression: r.MatchExpression,
      OperationExpression: r.OperationExpression,
      FunctionCall: r.FunctionCall,
      BooleanLiteral: r.BooleanLiteral,
      NullLiteral: r.NullLiteral,
      NumberLiteral: r.NumberLiteral,
      NamedRecordLiteral: r.NamedRecordLiteral,
      ValueIdentifier: r.ValueIdentifier,
      AnonymousFunctionLiteral: r.AnonymousFunctionLiteral,
      RecordLiteral: r.RecordLiteral,
      StringLiteral: r.StringLiteral,
      ListLiteral: r.ListLiteral,
      MapLiteral: r.MapLiteral,
    };
    return Parsimmon.alt<LangType["Expression"]>(
      ...Object.values(expressionParsers)
    );
  },

  ////////

  Program: (r) => {
    return withAt(
      r.StatementList.map(({ statements }) => {
        return {
          kind: "Program",
          statements,
        };
      })
    );
  },

  // return 5; f(); class Point()
  StatementList: (r) => {
    return withAt(
      Parsimmon.sepBy(r.Statement, r.__nl)
        .trim(r._nl)
        .map((statements) => {
          return {
            kind: "StatementList",
            statements,
          };
        })
    );
  },

  Statement: (r) => {
    const statementParsers: ExhaustiveParsers<LangType["Statement"]> = {
      ReturnStatement: r.ReturnStatement,
      IfStatement: r.IfStatement,
      MatchFunction: r.MatchFunction,
      MatchExpression: r.MatchExpression,
      NamedRecordDefinitionStatement: r.NamedRecordDefinitionStatement,
      NamedRecordDefinitionGroup: r.NamedRecordDefinitionGroup,
      ConstantDefinition: r.ConstantDefinition,
      FunctionCall: r.FunctionCall,
      DEBUG_LogType: r.DEBUG_LogType,
      DEBUG_Log: r.DEBUG_Log,
    };
    return Parsimmon.alt<LangType["Statement"]>(
      ...Object.values(statementParsers)
    );
  },

  ...LangDef_Match,

  // return 5
  ReturnStatement: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("return"),
        r.__,
        r.Expression,
        (_0, _1, expression) => {
          return {
            kind: "ReturnStatement",
            expression,
          };
        }
      )
    );
  },

  // NOTE: maybe support no parentheses too
  IfStatement: (r) => {
    const elseCase = Parsimmon.seqMap(
      r._,
      Parsimmon.string("else"),
      r._,
      r.Block.or(r.IfStatement),
      (_0, _1, _2, blockOrIf) => {
        return blockOrIf;
      }
    );

    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("if"),
        r._,
        Parsimmon.string("("),
        r._,
        r.Expression,
        r._,
        Parsimmon.string(")"),
        r._,
        r.Block,
        elseCase.atMost(1),
        (_0, _1, _2, _3, expression, _5, _6, _7, block, alt) => {
          return {
            kind: "IfStatement",
            guard: expression,
            block,
            elseCase: alt.length > 0 ? alt[0] : null,
          };
        }
      )
    );
  },

  // #log <expression> logs for debugging
  // we don't have function calls yet but this will do
  DEBUG_Log: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("#log"),
        r.__,
        r.Expression,
        function (_0, _1, expression) {
          return {
            kind: "DEBUG_Log",
            expression,
          };
        }
      )
    );
  },

  DEBUG_LogType: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("#logtype"),
        r.__,
        r.TypeExpression,
        function (_0, _1, typeExpression) {
          return {
            kind: "DEBUG_LogType",
            typeExpression,
          };
        }
      )
    );
  },

  //////////////

  // const x = 3
  ConstantDefinition: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("const"),
        r.__,
        r.ValueIdentifier,
        // TODO
        // r.TypeTag,
        r._,
        Parsimmon.string("="),
        r._,
        r.Expression,
        function (_0, _1, identifier, _2, _3, _4, expression) {
          return {
            kind: "ConstantDefinition",
            identifier,
            expression,
          };
        }
      )
    );
  },

  ...LangDef_Function,

  Block: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("{"),
        r.StatementList,
        Parsimmon.string("}"),
        function (_1, statements, _2) {
          return {
            kind: "Block",
            statements: statements.statements,
          };
        }
      )
    );
  },

  // // type Point(number, number)
  // NamedTupleDefinition: (r) => {
  //   return Parsimmon.seqMap(
  //     Parsimmon.string("type"),
  //     r.__,
  //     r.TypeIdentifier,
  //     r._,
  //     r.TupleDefinition,
  //     function (_0, _1, identifier, _2, tuple) {
  //       return {
  //         kind: "NamedTupleDefinition",
  //         identifier,
  //         tuple,
  //       };
  //     }
  //   );
  // },

  // //* (number, number)
  // TupleDefinition: (r) => {
  //   return Parsimmon.string("(")
  //     .then(Parsimmon.sepBy1(r.TypeIdentifier, r._comma))
  //     .skip(Parsimmon.string(")"))
  //     .map((definitions) => {
  //       return {
  //         kind: "TupleDefinition",
  //         definitions,
  //       };
  //     });
  // },

  ////////////////////////////////////////////////////////////////// Records ///

  //* Point(x: 5, y: 5)
  NamedRecordLiteral: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.index,
        Parsimmon.alt<
          LangType["TypeIdentifier"] | LangType["NestedTypeIdentifier"]
        >(
          r.TypeIdentifier.notFollowedBy(Parsimmon.string(".")),
          r.NestedTypeIdentifier
        ),
        r.RecordLiteral,
        Parsimmon.index,
        function (start, identifier, recordLiteral, end) {
          return {
            kind: "NamedRecordLiteral",
            identifier,
            recordLiteral,
            "@": { start, end },
          };
        }
      )
    );
  },

  //* Point(x: number, y: number)
  NamedRecordDefinition: (r) => {
    return withAt(
      Parsimmon.seqMap(
        r.TypeIdentifier,
        r._,
        r.RecordDefinition,
        function (identifier, _, record) {
          return {
            kind: "NamedRecordDefinition",
            identifier,
            record,
          };
        }
      )
    );
  },

  //* class Point(x: number, y: number)
  NamedRecordDefinitionStatement: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("class"),
        r._,
        r.NamedRecordDefinition,
        function (_0, _1, namedRecordDefinition) {
          return {
            kind: "NamedRecordDefinitionStatement",
            namedRecordDefinition,
          };
        }
      )
    );
  },

  // classes Card { King(); Queen(); Jack(); Number(value: number); }
  NamedRecordDefinitionGroup: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("classes"),
        r._,
        r.TypeIdentifier,
        r._,
        Parsimmon.string("{"),
        r._,
        Parsimmon.sepBy1(r.NamedRecordDefinition, r.__nl),
        r._,
        Parsimmon.string("}"),
        function (_0, _1, identifier, _3, _4, _5, nrdList, _7, _8) {
          return {
            kind: "NamedRecordDefinitionGroup",
            identifier,
            namedRecordDefinitions: nrdList,
          };
        }
      )
    );
  },

  //* (x: 5, y: 5)
  RecordLiteral: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.string("("),
        r._,
        Parsimmon.sepBy(r.NamedLiteral, r._comma),
        r._,
        Parsimmon.string(")"),
        (_0, _1, definitions, _3, _4) => {
          return {
            kind: "RecordLiteral",
            definitions,
          };
        }
      )
    );
  },

  //* (x: number, y: number)
  RecordDefinition: (r) => {
    return withAt(
      Parsimmon.seqMap(
        Parsimmon.index,
        Parsimmon.string("("),
        r._,
        // TBD: sepBy1 and make a different parser for Unit?
        Parsimmon.sepBy(r.NamedDefinition, r._comma),
        r._,
        Parsimmon.string(")"),
        Parsimmon.index,
        function (start, _0, _1, definitions, _2, _3, end) {
          return {
            kind: "RecordDefinition",
            definitions,
            "@": { start, end },
          };
        }
      )
    );
  },

  /////////////////////////////////////////////////////// Naming expressions ///

  // x: 5
  NamedLiteral: (r) => {
    return withAt(
      Parsimmon.seqMap(
        r.ValueIdentifier,
        r._,
        Parsimmon.string(":"),
        r._,
        r.Expression,
        (identifier, _1, _2, _3, expression) => {
          return {
            kind: "NamedLiteral",
            identifier,
            expression,
          };
        }
      )
    );
  },

  // x: number
  NamedDefinition: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.index,
      r.ValueIdentifier,
      r._,
      r.TypeTag,
      Parsimmon.index,
      (start, identifier, _3, typeTag, end) => {
        return {
          kind: "NamedDefinition",
          identifier,
          typeTag,
          "@": { start, end },
        };
      }
    );
  },
});

export function tryParse(str: string): LangType["Program"] {
  const result = Lang.Program.tryParse(str);
  return result;
}

// From: https://github.com/jneen/parsimmon/blob/master/examples/json.js

// Use the JSON standard's definition of whitespace rather than Parsimmon's.
const whitespace = Parsimmon.regexp(/\s*/m);

// JSON is pretty relaxed about whitespace, so let's make it easy to ignore
// after most text.
function token<T>(parser: Parsimmon.Parser<T>) {
  return parser.skip(whitespace);
}

// Turn escaped characters into real ones (e.g. "\\n" becomes "\n").
function interpretEscapes(str: string) {
  const escapes = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape: string) => {
    const type = escape.charAt(0);
    const hex = escape.slice(1);
    if (type === "u") {
      return String.fromCharCode(parseInt(hex, 16));
    }
    // eslint-disable-next-line no-prototype-builtins
    if (escapes.hasOwnProperty(type)) {
      return (escapes as any)[type];
    }
    return type;
  });
}

// function makeNode<U>(parser: Parsimmon.Parser<U>) {
//   return Parsimmon.seqMap(
//     Parsimmon.index,
//     parser,
//     Parsimmon.index,
//     function (start, value, end) {
//       return Object.freeze({
//         type: "myLanguage." + name,
//         value: value,
//         start: start,
//         end: end,
//       });
//     }
//   );
// }
