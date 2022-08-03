import * as Parsimmon from "parsimmon";
import { LangType_BinOp, LangDef_BinOp } from "./parser.binop";
import { LangType_Match, LangDef_Match } from "./parser.match";

type LT_NonNodeKeys = {
  [Key in keyof LangType]: LangType[Key] extends string | number | symbol
    ? Key
    : never;
}[keyof LangType];

// LangType, but skipping any entry that isn't an object
type LT_OnlyNodes = Omit<LangType, LT_NonNodeKeys>;
type ValueOf<T> = T[keyof T];
// example:
//   ExhaustiveParsers<LangType["Statement"]>
// can only be satisfied by an object that entries for all the types
// that make up LangType["Statement"]. Each entry maps to a Parsimmon.Parser.
type ExhaustiveParsers<T extends ValueOf<LT_OnlyNodes>> = {
  [key in T["kind"]]: Parsimmon.Parser<LangType[key]>;
};

// From: https://github.com/jneen/parsimmon/blob/master/examples/json.js

// Use the JSON standard's definition of whitespace rather than Parsimmon's.
let whitespace = Parsimmon.regexp(/\s*/m);

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
    let type = escape.charAt(0);
    let hex = escape.slice(1);
    if (type === "u") {
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (escapes.hasOwnProperty(type)) {
      return (escapes as any)[type];
    }
    return type;
  });
}

export type LangType = LangType_BinOp &
  LangType_Match & {
    _: string;
    __: string;
    _comma: string;
    _nl: string;
    __nl: string;
    blockComment: string;

    // Expressions
    ValueIdentifier: { kind: "ValueIdentifier"; value: string };
    TypeIdentifier: { kind: "TypeIdentifier"; value: string };
    NumberLiteral: { kind: "NumberLiteral"; value: number };
    StringLiteral: { kind: "StringLiteral"; value: string };
    BooleanLiteral: { kind: "BooleanLiteral"; value: boolean };

    NestedTypeIdentifier: {
      kind: "NestedTypeIdentifier";
      path: Array<LangType["TypeIdentifier"]>;
    };

    ReturnStatement: {
      kind: "ReturnStatement";
      expression: LangType["Expression"];
    };

    IfStatement: {
      kind: "IfStatement";
      guard: LangType["Expression"];
      block: LangType["Block"];
    };

    Expression:
      | LangType["BooleanLiteral"]
      | LangType["FunctionDefinition"]
      | LangType["MatchExpression"]
      | LangType["NumberLiteral"]
      | LangType["NamedRecordLiteral"]
      | LangType["FunctionCall"]
      | LangType["ValueIdentifier"]
      | LangType["RecordLiteral"]
      | LangType["StringLiteral"];

    FunctionCall: {
      kind: "FunctionCall";
      identifier: LangType["ValueIdentifier"];
      argument: LangType["RecordLiteral"];
    };

    FunctionDefinition: {
      kind: "FunctionDefinition";
      argument: LangType["RecordDefinition"];
      body: LangType["Block"];
    };

    ConstantDefinition: {
      kind: "ConstantDefinition";
      identifier: LangType["ValueIdentifier"];
      expression: LangType["Expression"];
    };

    // Records

    // Point(x: number, y: number)
    NamedRecordDefinition: {
      kind: "NamedRecordDefinition";
      identifier: LangType["TypeIdentifier"];
      record: LangType["RecordDefinition"];
    };

    // class Point(x: number, y: number)
    NamedRecordDefinitionStatement: {
      kind: "NamedRecordDefinitionStatement";
      namedRecordDefinition: LangType["NamedRecordDefinition"];
    };

    // classes Card { King(); Queen(); Jack(); Number(value: number) }
    NamedRecordDefinitionGroup: {
      kind: "NamedRecordDefinitionGroup";
      identifier: LangType["TypeIdentifier"];
      namedRecordDefinitions: Array<LangType["NamedRecordDefinition"]>;
    };

    // Point(x: 5, y: 3)
    NamedRecordLiteral: {
      kind: "NamedRecordLiteral";
      identifier: LangType["TypeIdentifier"] | LangType["NestedTypeIdentifier"];
      recordLiteral: LangType["RecordLiteral"];
    };

    //* (x: 5, y: 5)
    RecordLiteral: {
      kind: "RecordLiteral";
      definitions: Array<LangType["NamedLiteral"]>;
    };

    //* (x: number, y: number)
    RecordDefinition: {
      kind: "RecordDefinition";
      definitions: Array<LangType["NamedDefinition"]>;
    };

    // x: 5
    NamedLiteral: {
      kind: "NamedLiteral";
      identifier: LangType["ValueIdentifier"];
      expression: LangType["Expression"];
    };

    // x: number
    NamedDefinition: {
      kind: "NamedDefinition";
      identifier: LangType["ValueIdentifier"];
      typeTag: LangType["TypeTag"];
    };

    TypeExpression:
      | LangType["NamedRecordDefinition"]
      | LangType["RecordDefinition"]
      | LangType["TypeIdentifier"];

    // :string
    TypeTag: {
      kind: "TypeTag";
      identifier: LangType["TypeIdentifier"];
    };

    // #log value
    DEBUG_Log: {
      kind: "DEBUG_Log";
      expression: LangType["Expression"];
    };

    // #log Type
    DEBUG_LogType: {
      kind: "DEBUG_LogType";
      typeExpression: LangType["TypeExpression"];
    };

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

    Program: { kind: "Program"; statements: Array<LangType["Statement"]> };
    StatementList: {
      kind: "StatementList";
      statements: Array<LangType["Statement"]>;
    };
    Block: { kind: "Block"; statements: Array<LangType["Statement"]> };

    List: any;
    TupleDefinition: any;
    NamedTupleDefinition: any;
  };

export const Lang = Parsimmon.createLanguage<LangType>({
  _: (r) => {
    return Parsimmon.alt(r.blockComment, Parsimmon.optWhitespace);
  },
  __: () => {
    return Parsimmon.whitespace;
  },
  _comma: (r) => {
    return Parsimmon.string(",").trim(r._);
  },
  _nl: (r) => {
    return Parsimmon.regex(/[\s;]*/).trim(r._);
  },
  __nl: (r) => {
    return Parsimmon.alt(Parsimmon.string(";"), Parsimmon.string("\n")).trim(
      r._
    );
  },

  // /* ... */
  blockComment: (r) => {
    return Parsimmon.regex(/\/\*[\s\S]*\*\//);
  },

  ////////////////////////////////////////////////////////////// Expressions ///

  NumberLiteral: () => {
    return Parsimmon.regexp(/[0-9]+/).map((v) => ({
      kind: "NumberLiteral",
      value: Number(v),
    }));
  },

  // Regexp based parsers should generally be named for better error reporting.
  StringLiteral: () =>
    token(Parsimmon.regexp(/"((?:\\.|.)*?)"/, 1))
      .map(interpretEscapes)
      .map(
        (str) =>
          ({
            kind: "StringLiteral",
            value: str,
          } as const)
      )
      .desc("string"),

  BooleanLiteral: () => {
    return Parsimmon.regexp(/true|false/).map((str) => ({
      kind: "BooleanLiteral",
      value: str === "true",
    }));
  },

  ...LangDef_BinOp,

  // Card, Point, SomeDataStructure, number
  TypeIdentifier: () => {
    return Parsimmon.regexp(
      /string|number|boolean|object|array|[A-Z][a-zA-Z]*/
    ).map((v) => ({
      kind: "TypeIdentifier",
      value: v,
    }));
  },

  // TODO: test
  NestedTypeIdentifier: (r) => {
    return Parsimmon.sepBy1(r.TypeIdentifier, Parsimmon.string(".")).map(
      (path) => {
        return {
          kind: "NestedTypeIdentifier",
          path,
        };
      }
    );
  },

  // card, point, doThisOrThat
  ValueIdentifier: () => {
    return Parsimmon.regexp(
      /(?!string|number|boolean|object|array)[a-z][a-zA-Z]*/
    ).map((v) => ({
      kind: "ValueIdentifier",
      value: v,
    }));
  },

  // TODO: remove?
  List: (r) => {
    return Parsimmon.string("[")
      .then(r.Expression.sepBy(r._))
      .skip(Parsimmon.string("]"));
  },

  Expression: (r) => {
    const expressionParsers: ExhaustiveParsers<LangType["Expression"]> = {
      BooleanLiteral: r.BooleanLiteral,
      FunctionDefinition: r.FunctionDefinition,
      MatchExpression: r.MatchExpression,
      NumberLiteral: r.NumberLiteral,
      NamedRecordLiteral: r.NamedRecordLiteral,
      FunctionCall: r.FunctionCall,
      ValueIdentifier: r.ValueIdentifier,
      RecordLiteral: r.RecordLiteral,
      StringLiteral: r.StringLiteral,
    };
    return Parsimmon.alt<LangType["Expression"]>(
      ...Object.values(expressionParsers)
    );
  },

  ////////

  Program: (r) => {
    return r.StatementList.map(({ statements }) => {
      return {
        kind: "Program",
        statements,
      };
    });
  },

  // return 5; f(); class Point()
  StatementList: (r) => {
    return Parsimmon.sepBy(r.Statement, r.__nl)
      .trim(r._nl)
      .map((statements) => {
        return {
          kind: "StatementList",
          statements,
        };
      });
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
    return Parsimmon.seqMap(
      Parsimmon.string("return"),
      r.__,
      r.Expression,
      (_0, _1, expression) => {
        return {
          kind: "ReturnStatement",
          expression,
        };
      }
    );
  },

  // NOTE: maybe support no parentheses too
  IfStatement: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("if"),
      r._,
      Parsimmon.string("("),
      r._,
      r.Expression,
      r._,
      Parsimmon.string(")"),
      r._,
      r.Block,
      (_0, _1, _2, _3, expression, _5, _6, _7, block) => {
        return {
          kind: "IfStatement",
          guard: expression,
          block,
        };
      }
    );
  },

  // #log <expression> logs for debugging
  // we don't have function calls yet but this will do
  DEBUG_Log: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("#log"),
      r.__,
      r.Expression,
      function (_0, _1, expression) {
        return {
          kind: "DEBUG_Log",
          expression,
        };
      }
    );
  },

  DEBUG_LogType: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("#logtype"),
      r.__,
      r.TypeExpression,
      function (_0, _1, typeExpression) {
        return {
          kind: "DEBUG_LogType",
          typeExpression,
        };
      }
    );
  },

  //////////////

  // const x = 3
  ConstantDefinition: (r) => {
    return Parsimmon.seqMap(
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
    );
  },

  /* 
  TODO;
  const add = (x: number, y: number) => number {
  }

  function foo(x: number): number {
    return x + 3;
  }
   */
  FunctionDefinition: (r) => {
    return Parsimmon.seqMap(
      r.RecordDefinition,
      r._,
      Parsimmon.string("=>"),
      // TODO: type tag?
      r._,
      r.Block,
      function (argument, _1, _2, _3, body) {
        return {
          kind: "FunctionDefinition",
          argument,
          body,
        };
      }
    );
  },

  Block: (r) => {
    return (
      Parsimmon.string("{")
        // TBD: sepBy1 and make a different parser for Unit?
        .then(r.StatementList)
        .skip(Parsimmon.string("}"))
        .map(({ statements }) => {
          return {
            kind: "Block",
            statements,
          };
        })
    );
  },

  // log(msg: "hello")
  FunctionCall: (r) => {
    return Parsimmon.seqMap(
      r.ValueIdentifier,
      r.RecordLiteral,
      function (identifier, argument) {
        return {
          kind: "FunctionCall",
          identifier,
          argument,
        };
      }
    );
  },

  // type Point(number, number)
  NamedTupleDefinition: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("type"),
      r.__,
      r.TypeIdentifier,
      r._,
      r.TupleDefinition,
      function (_0, _1, identifier, _2, tuple) {
        return {
          kind: "NamedTupleDefinition",
          identifier,
          tuple,
        };
      }
    );
  },

  //* (number, number)
  TupleDefinition: (r) => {
    return Parsimmon.string("(")
      .then(Parsimmon.sepBy1(r.TypeIdentifier, r._comma))
      .skip(Parsimmon.string(")"))
      .map((definitions) => {
        return {
          kind: "TupleDefinition",
          definitions,
        };
      });
  },

  ////////////////////////////////////////////////////////////////// Records ///

  //* Point(x: 5, y: 5)
  NamedRecordLiteral: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.alt<
        LangType["TypeIdentifier"] | LangType["NestedTypeIdentifier"]
      >(
        r.TypeIdentifier.notFollowedBy(Parsimmon.string(".")),
        r.NestedTypeIdentifier
      ),
      r.RecordLiteral,
      function (identifier, recordLiteral) {
        return {
          kind: "NamedRecordLiteral",
          identifier,
          recordLiteral,
        };
      }
    );
  },

  //* Point(x: number, y: number)
  NamedRecordDefinition: (r) => {
    return Parsimmon.seqMap(
      r.TypeIdentifier,
      r.RecordDefinition,
      function (identifier, record) {
        return {
          kind: "NamedRecordDefinition",
          identifier,
          record,
        };
      }
    );
  },

  //* class Point(x: number, y: number)
  NamedRecordDefinitionStatement: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("class"),
      r._,
      r.NamedRecordDefinition,
      function (_0, _1, namedRecordDefinition) {
        return {
          kind: "NamedRecordDefinitionStatement",
          namedRecordDefinition,
        };
      }
    );
  },

  // classes Card { King(); Queen(); Jack(); Number(value: number); }
  NamedRecordDefinitionGroup: (r) => {
    return Parsimmon.seqMap(
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
    );
  },

  //* (x: 5, y: 5)
  RecordLiteral: (r) => {
    return Parsimmon.seqMap(
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
    );
  },

  //* (x: number, y: number)
  RecordDefinition: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("("),
      r._,
      // TBD: sepBy1 and make a different parser for Unit?
      Parsimmon.sepBy(r.NamedDefinition, r._comma),
      r._,
      Parsimmon.string(")"),
      function (_0, _1, definitions, _2, _3) {
        return {
          kind: "RecordDefinition",
          definitions,
        };
      }
    );
  },

  /////////////////////////////////////////////////////// Naming expressions ///

  // x: 5
  NamedLiteral: (r) => {
    return Parsimmon.seqMap(
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
    );
  },

  // x: number
  NamedDefinition: (r) => {
    return Parsimmon.seqMap(
      r.ValueIdentifier,
      r._,
      r.TypeTag,
      (identifier, _3, typeTag) => {
        return {
          kind: "NamedDefinition",
          identifier,
          typeTag,
        };
      }
    );
  },

  TypeExpression: (r) => {
    const typeParsers: ExhaustiveParsers<LangType["TypeExpression"]> = {
      TypeIdentifier: r.TypeIdentifier,
      RecordDefinition: r.RecordDefinition,
      NamedRecordDefinition: r.NamedRecordDefinition,
    };
    return Parsimmon.alt<LangType["TypeExpression"]>(
      ...Object.values(typeParsers)
    );
  },

  // :string
  TypeTag: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string(":"),
      r._,
      r.TypeIdentifier,
      (_2, _3, identifier) => {
        return {
          kind: "TypeTag",
          identifier,
        };
      }
    );
  },
});

export function tryParse(str: string): LangType["Program"] {
  const result = Lang.Program.tryParse(str);
  return result;
}

const program = `
export type Point (
  x: number,
  y: number,
)

*.add(a: Point, b: Point) => Point {
  return (
    x: a.x + b.x, 
    y: a.y + b.y
  )
}

.origin() => Point {
  return (x: 0, y: 0)
}

.double Point {
  return (x: arg.x * 2, b: arg.x * 2)
}

.double(a: Point) {
  return (x: a.x * 2, b: b.x * 2)
}

//////////  point.achi
//////////  point.extra.achi // Can extend point.
////////////////// if named differently, error when attempting
////////////////// to define a new function in point

import { Point } from "./point"

Point.unit() => Point {
  return (x: 1, y: 1)
}


const foo = Point(x:3, y:3)

foo = foo
  .double()
  .add(Point(x:3, y:3))



// index.achi

type LinkedMap<T>(
  _map: Map<string, T>,
) as Subbable<T> (
  subscriptors: Set<() => void>,
) as StateHashable (
  mutationHash: number,
)

.set<T>(lm: LinkedMap<T>, key: string, val: T) {
  lm._map.set(key, val);
  Subbable.notify(lm)
  StateHashable.didMutate(lm)
}




// Usage

Point.add(a, b)


const x = Point(x: 1, y: 2)

function add (a: Point, b: Point) {
  
}

const serialize(this: Point) {
  
}

x.serialize()

`;
