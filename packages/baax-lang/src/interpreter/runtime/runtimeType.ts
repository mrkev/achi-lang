import { exhaustive } from "../../nullthrows";
import { Lang, LangType } from "../../parser/parser";
import { BinaryTypeOperation } from "../../parser/parser.type";
import { stringOfAst } from "../stringOfValue";

function evaluateBinaryTypeOperation(
  src: BinaryTypeOperation
): RuntimeType["RuntimeType"] {
  switch (src.operator) {
    case "&":
      throw new Error("UNIMPLEMETNED: runtime interesection type");
    case "|": {
      const left = runtimeTypeOfTypeExpression(src.left);
      const right = runtimeTypeOfTypeExpression(src.right);

      return {
        kind: "UnionType",
        src: src,
        values: [left, right],
      };
    }
    default:
      throw exhaustive(src.operator);
  }
}

export type RuntimeType = {
  RuntimeType:
    | RuntimeType["PrimitiveType"]
    | RuntimeType["IdentifierType"]
    | RuntimeType["RecordDefinitionType"]
    | RuntimeType["UnionType"];

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

  UnionType: {
    kind: "UnionType";
    src: LangType["TypeExpression"];
    values: Array<RuntimeType["RuntimeType"]>;
  };

  // Named record definition is both a value and a type. Lives in NamedRecordKlass.
};

export function runtimeTypeOfTypeExpression(
  src: LangType["TypeExpression"]
): RuntimeType["RuntimeType"] {
  switch (src.kind) {
    case "NumberLiteral":
      return runtimePrimitiveType("number");
    case "StringLiteral":
      return runtimePrimitiveType("string");
    case "BooleanLiteral":
      return runtimePrimitiveType("boolean");
    case "TypeIdentifier":
      return runtimeTypeIdentifier(src);
    case "RecordDefinition":
      return runtimeRecordDefinitionType(src);
    case "BinaryTypeOperation":
      return evaluateBinaryTypeOperation(src);
    case "PrefixUnaryTypeOperation":
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

export function stringOfRuntimeType(type: RuntimeType["RuntimeType"]): string {
  switch (type.kind) {
    case "IdentifierType":
      return type.value;
    case "PrimitiveType":
      return type.value;
    case "RecordDefinition":
      return stringOfAst(type.src);
    case "UnionType":
      return type.values.map((t) => stringOfRuntimeType(t)).join(" | ");
    default:
      throw exhaustive(type);
  }
}

export function runtimeTypeOf(str: string): RuntimeType["RuntimeType"] {
  return runtimeTypeOfTypeExpression(Lang.TypeExpression.tryParse(str));
}
