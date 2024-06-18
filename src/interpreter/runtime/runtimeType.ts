import { exhaustive } from "../../nullthrows";
import { LangType } from "../../parser/parser";
import { stringOfAst } from "../stringOfValue";

export type RuntimeType = {
  RuntimeType:
    | RuntimeType["PrimitiveType"]
    | RuntimeType["IdentifierType"]
    | RuntimeType["RecordDefinitionType"];

  PrimitiveType: {
    kind: "PrimitiveType";
    value: "string" | "number" | "boolean" | "null";
  };

  IdentifierType: {
    kind: "IdentifierType";
    src: LangType["TypeIdentifier"];
    value: string;
  };

  RecordDefinitionType: {
    kind: "RecordDefinition";
    src: LangType["RecordDefinition"];
    definitions: Map<string, RuntimeType["RuntimeType"]>;
  };

  // Named record definition is both a value and a type. Lives in NamedRecordKlass.
};

export function runtimeTypeOfTypeExpression(src: LangType["TypeExpression"]) {
  switch (src.kind) {
    // case "NumberLiteral":
    //   return runtimePrimitiveType("number");
    // case "StringLiteral":
    //   return runtimePrimitiveType("string");
    // case "BooleanLiteral":
    //   return runtimePrimitiveType("boolean");
    case "TypeIdentifier":
      return runtimeTypeIdentifier(src);
    case "RecordDefinition":
      return runtimeRecordDefinitionType(src);
    case "NamedRecordDefinition":
      throw new Error("Unimplemented");
    default:
      throw exhaustive(src);
  }
}

export function runtimePrimitiveType(
  value: "string" | "number" | "boolean"
): RuntimeType["PrimitiveType"] {
  return {
    kind: "PrimitiveType",
    value,
  };
}

export function runtimeTypeIdentifier(
  src: LangType["TypeIdentifier"]
): RuntimeType["IdentifierType"] {
  return {
    kind: "IdentifierType",
    src,
    value: src.value,
  };
}

export function runtimeRecordDefinitionType(
  src: LangType["RecordDefinition"]
): RuntimeType["RecordDefinitionType"] {
  const defs = new Map<string, RuntimeType["RuntimeType"]>();
  for (const definition of src.definitions) {
    defs.set(
      definition.identifier.value,
      runtimeTypeOfTypeExpression(definition.typeTag.typeExpression)
    );
  }
  return {
    kind: "RecordDefinition",
    src,
    definitions: defs,
  };
}

export function stringOfRuntimeType(type: RuntimeType["RuntimeType"]) {
  switch (type.kind) {
    case "IdentifierType":
      return type.value;
    case "PrimitiveType":
      return type.value;
    case "RecordDefinition":
      return stringOfAst(type.src);
  }
}
