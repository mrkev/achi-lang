import { LangType } from "../parser/parser";
import { ScriptError } from "./interpreterErrors";
import { AnonymousFunctionInstance } from "./runtime/runtime.functions";
import { MatchFunctionInstance } from "./runtime/runtime.match";
import {
  NamedRecordDefinitionGroupInstance,
  NamedRecordInstance,
  NamedRecordKlass,
  RecordInstance,
} from "./runtime/runtime.records";

export type Value =
  /*
   * Primitives
   */
  // 3
  | { kind: "number"; value: number; src: LangType["Expression"] | null }
  // "hello"
  | { kind: "string"; value: string }
  // false
  | { kind: "boolean"; value: boolean }
  // null
  | { kind: "nil"; value: null }
  /*
   * Data Structures
   */
  // (x: 3, y: 2)
  | { kind: "RecordInstance"; value: RecordInstance }
  // Point(x: 3, y: 2)
  | { kind: "NamedRecordInstance"; value: NamedRecordInstance }
  // class Point(x: number, y: number)
  | { kind: "NamedRecordKlass"; value: NamedRecordKlass }
  // function printPoint matches (point: Point) { ... }
  | { kind: "MatchFunctionInstance"; value: MatchFunctionInstance }
  // classes Cards { ... }
  | {
      kind: "NamedRecordDefinitionGroupInstance";
      value: NamedRecordDefinitionGroupInstance;
    }
  | {
      kind: "AnonymousFunctionInstance";
      value: AnonymousFunctionInstance;
    };

// Validators

function expectNumber(value: Value): { kind: "number"; value: number } {
  if (value.kind === "number") {
    return value;
  } else {
    throw new Error("NUMBER EXPECTED");
  }
}

function expectString(value: Value): { kind: "string"; value: string } {
  if (value.kind === "string") {
    return value;
  } else {
    const src = (value as any).src ?? {};
    const pos = src.pos;
    console.log("HELLO");
    throw new ScriptError(`STRING EXPECTED`, pos);
  }
}

function expectBoolean(value: Value): { kind: "boolean"; value: boolean } {
  if (value.kind === "boolean") {
    return value;
  } else {
    throw new Error("BOOLEAN EXPECTED");
  }
}
export { expectNumber, expectString, expectBoolean };

// Constructors

function number(
  value: number,
  src?: LangType["Expression"]
): Readonly<{
  kind: "number";
  value: number;
  src: LangType["Expression"] | null;
}> {
  return { kind: "number", value, src: src ?? null } as const;
}

function string(value: string): Readonly<{ kind: "string"; value: string }> {
  return { kind: "string", value } as const;
}

function boolean(
  value: boolean
): Readonly<{ kind: "boolean"; value: boolean }> {
  return { kind: "boolean", value } as const;
}

function nil(value: null): Readonly<{ kind: "nil"; value: null }> {
  return { kind: "nil", value } as const;
}

// TODO: kind: "NamedRecordInstance" (and others) lowercase like primitives?
function namedRecordInstance(
  value: NamedRecordInstance
): Readonly<{ kind: "NamedRecordInstance"; value: NamedRecordInstance }> {
  return { kind: "NamedRecordInstance", value } as const;
}

// TODO: kind: "RecordInstance" (and others) lowercase like primitives?
function recordInstance(
  value: RecordInstance
): Readonly<{ kind: "RecordInstance"; value: RecordInstance }> {
  return { kind: "RecordInstance", value } as const;
}

export { number, string, boolean, nil };
export { namedRecordInstance, recordInstance };

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
