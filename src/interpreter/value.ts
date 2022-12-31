import { AnonymousFunctionInstance } from "./runtime/runtime.functions";
import { MatchFunctionInstance } from "./runtime/runtime.match";
import {
  NamedRecordDefinitionGroupInstance,
  NamedRecordInstance,
  NamedRecordKlass,
  RecordLiteralInstance,
} from "./runtime/runtime.records";

export type Value =
  // 3
  | { kind: "number"; value: number }
  // "hello"
  | { kind: "string"; value: string }
  // false
  | { kind: "boolean"; value: boolean }
  // null
  | { kind: "empty"; value: null }
  // Point(x: 3, y: 2)
  | { kind: "NamedRecordInstance"; value: NamedRecordInstance }
  // function printPoint matches (point: Point) { ... }
  | { kind: "MatchFunctionInstance"; value: MatchFunctionInstance }
  // class Point(x: number, y: number)
  | { kind: "NamedRecordKlass"; value: NamedRecordKlass }
  // (x: 3, y: 2)
  | { kind: "RecordLiteralInstance"; value: RecordLiteralInstance }
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
    throw new Error("NUMBER EXPECTED");
  }
}

export { expectNumber, expectString };

// Constructors

function number(value: number): { kind: "number"; value: number } {
  return { kind: "number", value };
}

function string(value: string): { kind: "string"; value: string } {
  return { kind: "string", value };
}

function boolean(value: boolean): { kind: "boolean"; value: boolean } {
  return { kind: "boolean", value };
}

function empty(value: null): { kind: "empty"; value: null } {
  return { kind: "empty", value };
}

export { number, string, boolean, empty };

// // Point(x: 3, y: 2)
// function NamedRecordInstance(value: NamedRecordInstance): {
//   kind: "NamedRecordInstance";
//   value: NamedRecordInstance;
// } {
//   return { kind: "NamedRecordInstance", value };
// }
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
