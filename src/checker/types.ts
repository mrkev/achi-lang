import { Context } from "../interpreter/Context";
import { exhaustive } from "../interpreter/nullthrows";
import { LangType } from "../parser/parser";

export type Type =
  | { kind: "string" }
  | { kind: "stringLiteral"; value: string }
  | { kind: "number" }
  | { kind: "numberLiteral"; value: number }
  | { kind: "boolean" }
  | { kind: "booleanLiteral"; value: boolean }
  | { kind: "list"; valueType: Type }
  | { kind: "map"; valueType: Type }
  | RecordType
  | { kind: "namedRecord"; name: string; recordType: RecordType }
  | { kind: "function"; argumentType: RecordType; returnType: Type }
  | { kind: "any" }
  // pointer type, should check scope for concrete type value. Only valid for identifiers.
  | { kind: "reference" };

export type RecordType = { kind: "record"; shape: Map<string, Type> };

export function printType(type: Type) {
  switch (type.kind) {
    case "string":
    case "number":
    case "boolean":
      return type.kind;
    case "stringLiteral":
    case "numberLiteral":
    case "booleanLiteral":
      return `${type.kind.replace("Literal", "")}(${String(type.value)})`;
    case "list":
    case "map":
    case "record":
    case "namedRecord":
    case "function":
    case "any":
    case "reference":
      return "TODO: " + type.kind;
    default: {
      throw exhaustive(type);
    }
  }
}
//
function typeOf(expression: LangType["Expression"], scope: Context): Type {
  switch (expression.kind) {
    case "BooleanLiteral":
      return { kind: "booleanLiteral", value: expression.value };
    case "NumberLiteral":
      return { kind: "numberLiteral", value: expression.value };
    case "StringLiteral":
      return { kind: "stringLiteral", value: expression.value };

    case "ValueIdentifier":
    case "NamedRecordLiteral":
    case "RecordLiteral":
    // case "FunctionDefinition":
    case "FunctionCall":
    case "MatchExpression":
    case "MapLiteral":
    case "ListLiteral":
    case "AnonymousFunctionLiteral":
    case "PREFIX":
    case "POSTFIX":
    case "BINARY_RIGHT":
    case "BINARY_LEFT":
      throw new Error("typeOf, not implemented");
    default: {
      throw exhaustive(expression);
    }
  }
}
// A <= B
// if function(arg: TypeB) {...}
// is function(x as TypeA) ok
export function isSubtype(sub: Type, sup: Type): boolean {
  if (sup.kind === "any" || sub.kind === "any") {
    return true;
  }

  if (sup.kind === "reference" || sub.kind === "reference") {
    throw new Error(
      "todo: make reference types their own thing? Instead of being part of Type"
    );
  }

  switch (sup.kind) {
    case "string": {
      switch (sub.kind) {
        case "string":
        case "stringLiteral":
          return true;
        case "number":
        case "numberLiteral":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    }

    case "stringLiteral": {
      switch (sub.kind) {
        case "stringLiteral":
          return sub.value === sup.value;
        case "string":
        case "number":
        case "numberLiteral":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    }
    case "number":
      switch (sub.kind) {
        case "number":
        case "numberLiteral":
          return true;
        case "stringLiteral":
        case "string":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "numberLiteral":
      switch (sub.kind) {
        case "numberLiteral":
          return sup.value === sub.value;
        case "stringLiteral":
        case "string":
        case "number":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "boolean":
      switch (sub.kind) {
        case "boolean":
        case "booleanLiteral":
          return true;
        case "stringLiteral":
        case "string":
        case "number":
        case "numberLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "booleanLiteral":
      switch (sub.kind) {
        case "booleanLiteral":
          return sup.value === sub.value;
        case "stringLiteral":
        case "string":
        case "number":
        case "numberLiteral":
        case "boolean":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "list":
    case "map":
    case "record":
    case "namedRecord":
    case "function":
      throw new Error("isSubtype, not implemented");
    default: {
      throw exhaustive(sup);
    }
  }
}
