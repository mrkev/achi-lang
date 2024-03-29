import { LangType } from "../../parser/parser";
import { ScriptError } from "../interpreterErrors";
import {
  AnonymousFunctionInstance,
  MatchFunctionInstance,
} from "./runtime.functions";
import {
  NamedRecordDefinitionGroupInstance,
  NamedRecordInstance,
  NamedRecordKlass,
} from "./runtime.namedrecords";

export interface ValueI {
  kind: string;
}

// 3
export type Number = Readonly<{
  kind: "number";
  value: number;
  src: LangType["Expression"] | null;
}>;

// "hello"
export type String = Readonly<{ kind: "string"; value: string }>;

// false
export type Boolean = Readonly<{ kind: "boolean"; value: boolean }>;

// null
export type Nil = Readonly<{ kind: "nil"; value: null }>;

// [1, 2, 3]
export type ListInstance = {
  kind: "ListInstance";
  value: Value[];
};

// ie, (x: 3, y: 4)
export type RecordInstance = Readonly<{
  kind: "RecordInstance";
  src: LangType["RecordLiteral"];
  props: Map<string, Value>;
}>;

export type Value =
  /*
   * Primitives
   */
  | Number // 3
  | String // "hello"
  | Boolean // false
  | Nil // null
  /*
   * Simple Data Structures
   */
  | ListInstance // [1, 2, 3]
  | RecordInstance // (x: 3, y: 2)
  /*
   * Complex Instances
   */
  | NamedRecordInstance // Point(x: 3, y: 2)
  | NamedRecordKlass // class Point(x: number, y: number)
  | NamedRecordDefinitionGroupInstance // classes Cards { ... }
  /*
   * Functions
   */
  | MatchFunctionInstance // function printPoint matches (point: Point) { ... }
  | AnonymousFunctionInstance; // (point: Point) => {...}

// Validators

function expectNumber(value: Value): Number {
  if (value.kind === "number") {
    return value;
  } else {
    throw new Error("NUMBER EXPECTED");
  }
}

function expectString(value: Value): String {
  if (value.kind === "string") {
    return value;
  } else {
    const src = (value as any).src ?? {};
    const pos = src.pos;
    throw new ScriptError(`STRING EXPECTED`, pos);
  }
}

function expectBoolean(value: Value): Boolean {
  if (value.kind === "boolean") {
    return value;
  } else {
    throw new Error("BOOLEAN EXPECTED");
  }
}

export { expectNumber, expectString, expectBoolean };

// Constructors

function number(value: number, src?: LangType["Expression"]): Number {
  return { kind: "number", value, src: src ?? null } as const;
}

function string(value: string): String {
  return { kind: "string", value } as const;
}

function boolean(value: boolean): Boolean {
  return { kind: "boolean", value } as const;
}

function nil(value: null): Nil {
  return { kind: "nil", value } as const;
}

function list(value: Value[]): ListInstance {
  return { kind: "ListInstance", value: value } as const;
}

function record(
  src: LangType["RecordLiteral"],
  props: Map<string, Value>
): RecordInstance {
  return { kind: "RecordInstance", src, props } as const;
}

export { number, string, boolean, nil, list };

// TODO: kind: "NamedRecordInstance" (and others) lowercase like primitives?
function namedRecordInstance(
  ast: LangType["NamedRecordLiteral"],
  konstructor: NamedRecordKlass,
  recordLiteralInstance: RecordInstance
): NamedRecordInstance {
  return new NamedRecordInstance(ast, konstructor, recordLiteralInstance);
}

export { namedRecordInstance, record };

// // function printPoint matches (point: Point) { ... }
// function MatchFunctionInstance(value: MatchFunctionInstance): {
//   kind: "MatchFunctionInstance";
//   value: MatchFunctionInstance;
// } {
//   return { kind: "MatchFunctionInstance", value };
// }
// // class Point(x: number, y: number)
// function NamedRecordKlass(value: NamedRecordKlass): {
//   kind: "NamedRecordKlass";
//   value: NamedRecordKlass;
// } {
//   return { kind: "NamedRecordKlass", value };
// }
// // (x: 3, y: 2)
// function RecordLiteralInstance(value: RecordLiteralInstance): {
//   kind: "RecordLiteralInstance";
//   value: RecordLiteralInstance;
// } {
//   return { kind: "RecordLiteralInstance", value };
// }
// // classes Cards { ... }
// | {
//     kind: "NamedRecordDefinitionGroupInstance";
//     value: NamedRecordDefinitionGroupInstance;
//   }
// | {
//     kind: "AnonymousFunctionInstance";
//     value: AnonymousFunctionInstance;
//   };
