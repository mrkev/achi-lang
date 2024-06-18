import { LangType } from "../../parser/parser";
import { NamedRecordKlass } from "./runtime.namedrecords";

export interface ValueI {
  kind: string;
}

export type ValueType = {
  Value:
    | ValueType["Number"]
    | ValueType["String"]
    | ValueType["Boolean"]
    | ValueType["Nil"]
    | ValueType["ListInstance"]
    | ValueType["RecordInstance"]
    | ValueType["NamedRecordInstance"]
    | ValueType["NamedRecordKlass"]
    | ValueType["NamedRecordDefinitionGroupInstance"]
    | ValueType["MatchFunctionInstance"]
    | ValueType["AnonymousFunctionInstance"];

  /*
   * Primitives
   */

  // 3
  Number: Readonly<{
    kind: "number";
    value: number;
    src: LangType["Expression"] | null;
  }>;
  // "hello"
  String: Readonly<{ kind: "string"; value: string }>;
  // false
  Boolean: Readonly<{ kind: "boolean"; value: boolean }>;
  // null
  Nil: Readonly<{ kind: "nil" }>;

  /*
   * Simple Data Structures
   */

  // [1, 2, 3]
  ListInstance: Readonly<{
    kind: "ListInstance";
    value: ValueType["Value"][];
  }>;
  // (x: 3, y: 2)
  RecordInstance: Readonly<{
    kind: "RecordInstance";
    src: LangType["RecordLiteral"];
    props: Map<string, ValueType["Value"]>;
  }>;

  /*
   * Complex Instances
   */

  // Point(x: 3, y: 2)
  NamedRecordInstance: Readonly<{
    kind: "NamedRecordInstance";
    konstructor: NamedRecordKlass;
    recordLiteral: ValueType["RecordInstance"];
    src: LangType["NamedRecordLiteral"];
  }>;
  // class Point(x: number, y: number)
  NamedRecordKlass: NamedRecordKlass;
  // classes Card { King(); Queen(); ...etc }
  NamedRecordDefinitionGroupInstance: Readonly<{
    kind: "NamedRecordDefinitionGroupInstance";
    src: LangType["NamedRecordDefinitionGroup"];
    klasses: Map<string, NamedRecordKlass>;
  }>;

  /*
   * Functions
   */

  // function printPoint matches (point: Point) { ... }
  MatchFunctionInstance: Readonly<{
    kind: "MatchFunctionInstance";
    ast: LangType["MatchFunction"];
  }>;
  // ie, (x: 3) => { return 3 }
  AnonymousFunctionInstance: Readonly<{
    kind: "AnonymousFunctionInstance";
    ast: LangType["AnonymousFunctionLiteral"];
  }>;
};

// Constructors

export function number(
  value: number,
  src?: LangType["Expression"]
): ValueType["Number"] {
  return { kind: "number", value, src: src ?? null } as const;
}

export function string(value: string): ValueType["String"] {
  return { kind: "string", value } as const;
}

export function boolean(value: boolean): ValueType["Boolean"] {
  return { kind: "boolean", value } as const;
}

export function nil(): ValueType["Nil"] {
  return { kind: "nil" } as const;
}

export function list(value: ValueType["Value"][]): ValueType["ListInstance"] {
  return { kind: "ListInstance", value: value } as const;
}

export function record(
  src: LangType["RecordLiteral"],
  props: Map<string, ValueType["Value"]>
): ValueType["RecordInstance"] {
  return { kind: "RecordInstance", src, props } as const;
}

// TODO: kind: "NamedRecordInstance" (and others) lowercase like primitives?
export function namedRecordInstance(
  ast: LangType["NamedRecordLiteral"],
  konstructor: NamedRecordKlass,
  recordLiteralInstance: ValueType["RecordInstance"]
): ValueType["NamedRecordInstance"] {
  return {
    kind: "NamedRecordInstance",
    src: ast,
    konstructor,
    recordLiteral: recordLiteralInstance,
  };
}

export function namedRecordDefinitionGroupInstance(
  ast: LangType["NamedRecordDefinitionGroup"],
  klasses: Map<string, NamedRecordKlass>
): ValueType["NamedRecordDefinitionGroupInstance"] {
  return {
    kind: "NamedRecordDefinitionGroupInstance",
    src: ast,
    klasses,
  };
}

export function matchFunctionInstance(
  literal: LangType["MatchFunction"]
): ValueType["MatchFunctionInstance"] {
  return { kind: "MatchFunctionInstance", ast: literal };
}

export function anonymousFunctionInstance(
  literal: LangType["AnonymousFunctionLiteral"]
): ValueType["AnonymousFunctionInstance"] {
  return { kind: "AnonymousFunctionInstance", ast: literal };
}

export function valueOfJavascriptValue(x: unknown) {
  if (typeof x === "number") {
    return number(x);
  } else if (typeof x === "string") {
    return string(x);
  } else if (typeof x === "boolean") {
    return boolean(x);
  } else if (x == null) {
    return nil();
  } else if (Array.isArray(x)) {
    throw new Error("ARRAY");
  } else if (typeof x === "object") {
    throw new Error("OBJ");
  } else if (typeof x === "function") {
    throw new Error("FUNCTION");
  } else {
    throw new Error("Javascript value " + String(x) + "can't be used");
  }
}

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
