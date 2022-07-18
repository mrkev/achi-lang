import * as Parsimmon from "parsimmon";
import { LangType_BinOp, LangDef_BinOp } from "./parser.binop";
import { LangType_Match, LangDef_Match } from "./parser.match";

// console.log(Lang.NamedTupleDefinition.tryParse("type Point(number, number)"));

/*

type Point (
  x: number,
  y: number,
)

const a = {} => {

}


classes {
  King()
  Queen()
  Jack()
  Number(value: number)
}

*/

export enum NodeKind {
  NamedDefinition = "NamedDefinition",
  RecordDefinition = "RecordDefinition",
  NamedTupleDefinition = "NamedTupleDefinition",
  TupleDefinition = "TupleDefinition",
  TypeTag = "TypeTag",
}

const list: ReadonlyArray<Parsimmon.Parser<LangType["Statement"]>> = [
  // r.ReturnStatement,
  // r.IfStatement,
  // r.NamedRecordDefinitionStatement,
  // r.NamedRecordDefinitionGroup,
  // r.ConstantAssignment,
  // r.FunctionCall,
  // r.DEBUG_Log,
] as const;

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

type x = Parsimmon.UnParser<typeof list[number]>;

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
    Identifier: { kind: "Identifier"; value: string };
    NumberLiteral: { kind: "NumberLiteral"; value: number };
    StringLiteral: { kind: "StringLiteral"; value: string };

    ReturnStatement: {
      kind: "ReturnStatement";
      expression: LangType["Expression"];
    };

    IfStatement: {
      kind: "IfStatement";
      guard: LangType["Expression"];
      block: LangType["Block"];
    };

    // Maybe just methods instead?
    // ForStatement: {
    // },

    Expression:
      | LangType["FunctionDefinition"]
      | LangType["NumberLiteral"]
      | LangType["NamedRecordLiteral"]
      | LangType["Identifier"]
      | LangType["RecordLiteral"]
      | LangType["StringLiteral"];

    FunctionCall: {
      kind: "FunctionCall";
      identifier: LangType["Identifier"];
      argument: LangType["RecordLiteral"];
    };

    FunctionDefinition: {
      kind: "FunctionDefinition";
      argument: LangType["RecordDefinition"];
      body: LangType["Block"];
    };

    ConstantAssignment: {
      kind: "ConstantAssignment";
      identifier: LangType["Identifier"];
      expression: LangType["Expression"];
    };

    // Records

    NamedRecordDefinition: {
      kind: "NamedRecordDefinition";
      identifier: LangType["Identifier"];
      record: LangType["RecordDefinition"];
    };

    // class Point(x: number, y: number)
    NamedRecordDefinitionStatement: {
      kind: "NamedRecordDefinitionStatement";
      namedRecordDefinition: LangType["NamedRecordDefinition"];
    };

    NamedRecordDefinitionGroup: {
      kind: "NamedRecordDefinitionGroup";
      identifier: LangType["Identifier"];
      namedRecordDefinitions: Array<LangType["NamedRecordDefinition"]>;
    };

    // Point(x: 5, y: 3)
    NamedRecordLiteral: {
      kind: "NamedRecordLiteral";
      identifier: LangType["Identifier"];
      recordLiteral: LangType["RecordLiteral"];
    };

    //* (x: 5, y: 5)
    RecordLiteral: {
      kind: "RecordLiteral";
      definitions: Array<LangType["NamedLiteral"]>;
    };

    //* (x: number, y: number)
    RecordDefinition: {
      kind: NodeKind.RecordDefinition;
      definitions: Array<LangType["NamedDefinition"]>;
    };

    // x: 5
    NamedLiteral: {
      kind: "NamedLiteral";
      identifier: LangType["Identifier"];
      expression: LangType["Expression"];
    };

    // x: number
    NamedDefinition: {
      kind: NodeKind.NamedDefinition;
      identifier: LangType["Identifier"];
      typeTag: LangType["TypeTag"];
    };

    Type: LangType["RecordDefinition"] | LangType["Identifier"];

    // :string
    TypeTag: {
      kind: NodeKind.TypeTag;
      identifier: LangType["Identifier"];
    };

    DEBUG_Log: {
      kind: "DEBUG_Log";
      expression: LangType["Expression"];
    };

    Statement:
      | LangType["ReturnStatement"]
      | LangType["IfStatement"]
      | LangType["NamedRecordDefinitionStatement"]
      | LangType["NamedRecordDefinitionGroup"]
      | LangType["ConstantAssignment"]
      | LangType["MatchFunction"]
      | LangType["FunctionCall"]
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

  ...LangDef_BinOp,

  Identifier: () => {
    return Parsimmon.regexp(/[a-zA-Z]+/).map((v) => ({
      kind: "Identifier",
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
    return Parsimmon.alt<
      | LangType["FunctionDefinition"]
      | LangType["NumberLiteral"]
      | LangType["NamedRecordLiteral"]
      | LangType["Identifier"]
      | LangType["RecordLiteral"]
      | LangType["StringLiteral"]
    >(
      r.FunctionDefinition,
      r.NumberLiteral,
      r.NamedRecordLiteral,
      r.Identifier,
      r.RecordLiteral,
      r.StringLiteral
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
      NamedRecordDefinitionStatement: r.NamedRecordDefinitionStatement,
      NamedRecordDefinitionGroup: r.NamedRecordDefinitionGroup,
      ConstantAssignment: r.ConstantAssignment,
      FunctionCall: r.FunctionCall,
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

  //////////////

  // const x = 3
  ConstantAssignment: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("const"),
      r.__,
      r.Identifier,
      // TODO
      // r.TypeTag,
      r._,
      Parsimmon.string("="),
      r._,
      r.Expression,
      function (_0, _1, identifier, _2, _3, _4, expression) {
        return {
          kind: "ConstantAssignment",
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
      r.Identifier,
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
      r.Identifier,
      r._,
      r.TupleDefinition,
      function (_0, _1, identifier, _2, tuple) {
        return {
          kind: NodeKind.NamedTupleDefinition,
          identifier,
          tuple,
        };
      }
    );
  },

  //* (number, number)
  TupleDefinition: (r) => {
    return Parsimmon.string("(")
      .then(Parsimmon.sepBy1(r.Identifier, r._comma))
      .skip(Parsimmon.string(")"))
      .map((definitions) => {
        return {
          kind: NodeKind.TupleDefinition,
          definitions,
        };
      });
  },

  ////////////////////////////////////////////////////////////////// Records ///

  //* Point(x: 5, y: 5)
  NamedRecordLiteral: (r) => {
    return Parsimmon.seqMap(
      r.Identifier,
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
      r.Identifier,
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

  NamedRecordDefinitionGroup: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("classes"),
      r._,
      r.Identifier,
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
    return Parsimmon.string("(")
      .then(Parsimmon.sepBy(r.NamedLiteral, r._comma))
      .skip(Parsimmon.string(")"))
      .map((definitions) => {
        return {
          kind: "RecordLiteral",
          definitions,
        };
      });
  },

  //* (x: number, y: number)
  RecordDefinition: (r) => {
    return (
      Parsimmon.string("(")
        // TBD: sepBy1 and make a different parser for Unit?
        .then(Parsimmon.sepBy(r.NamedDefinition, r._comma))
        .skip(Parsimmon.string(")"))
        .map((definitions) => {
          return {
            kind: NodeKind.RecordDefinition,
            definitions,
          };
        })
    );
  },

  /////////////////////////////////////////////////////// Naming expressions ///

  // x: 5
  NamedLiteral: (r) => {
    return Parsimmon.seqMap(
      r.Identifier,
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
      r.Identifier,
      r._,
      r.TypeTag,
      (identifier, _3, typeTag) => {
        return {
          kind: NodeKind.NamedDefinition,
          identifier,
          typeTag,
        };
      }
    );
  },

  Type: (r) => {
    const typeParsers: ExhaustiveParsers<LangType["Type"]> = {
      Identifier: r.Identifier,
      RecordDefinition: r.RecordDefinition,
    };
    return Parsimmon.alt<LangType["Type"]>(...Object.values(typeParsers));
  },

  // :string
  TypeTag: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string(":"),
      r._,
      r.Identifier,
      (_2, _3, identifier) => {
        return {
          kind: NodeKind.TypeTag,
          identifier,
        };
      }
    );
  },
});

export function tryParse(str: string) {
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
