import { exhaustive } from "../nullthrows";
import { LangType } from "../parser/parser";
import { stringOfRuntimeType } from "./runtime/runtimeType";
import { ValueType } from "./runtime/value";

export function stringOfValue(value: ValueType["Value"]): string {
  return String(printableOfValue(value));
}

export type ValueOrArray<T> = T | Array<ValueOrArray<T>>;

export function printableOfValue(
  value: ValueType["Value"]
): ValueOrArray<number | string | boolean | null> {
  const { kind } = value;
  switch (kind) {
    case "number":
    case "string":
    case "boolean": {
      return value.value;
    }

    case "ListInstance": {
      return value.value.map((val) => printableOfValue(val));
    }

    case "NamedRecordInstance": {
      let str = value.konstructor.classname + " {";
      const entries = [...value.recordLiteral.props.entries()];
      if (entries.length > 0) {
        str += "\n";
      }
      for (const [key, val] of entries) {
        const typeExpression = value.konstructor.valueSpec.get(key);
        str += `  ${key}: ${stringOfValue(val)} (${
          typeExpression == null
            ? "<not found>"
            : stringOfRuntimeType(typeExpression)
        })\n`;
      }
      str += "}";
      return str;
    }

    case "MatchFunctionInstance": {
      return `[Function: ${value.ast.identifier.value}]`;
    }

    case "NamedRecordKlass": {
      return `[Class: ${value.classname}]`;
    }

    case "RecordInstance": {
      // return "todo RecordLiteral";
      let str = "(\n";
      for (const [key, val] of value.props.entries()) {
        // add indendation
        const valStr = stringOfValue(val)
          .split("\n")
          .map((s, i) => (i > 0 ? `  ${s}` : s))
          .join("\n");
        str += `  ${key}: ${valStr},\n`;
      }
      str += ")";
      return str;
    }

    case "NamedRecordDefinitionGroupInstance": {
      return `[classes: ${value.src.identifier.value} (${value.src.namedRecordDefinitions.length} classes)]`;
    }

    case "AnonymousFunctionInstance": {
      return `${stringOfAst(value.ast.argument)} => ...`;
    }

    case "nil": {
      return null;
    }

    default:
      throw exhaustive(kind);
  }
}

export function stringOfAst(
  node:
    | LangType["RecordDefinition"]
    | LangType["NamedDefinition"]
    | LangType["TypeTag"]
    | LangType["TypeExpression"]
): string {
  switch (node.kind) {
    case "NamedDefinition":
      return `${node.identifier.value}${stringOfAst(node.typeTag)}`;
    case "RecordDefinition":
      return `(${node.definitions.map(stringOfAst).join(", ")})`;
    case "TypeTag":
      return `: ${stringOfAst(node.typeExpression)}`;
    case "TypeIdentifier":
      return `${node.value}`;
    // case "NamedRecordDefinition":
    //   return `${node.identifier}${stringOfAst(node.record)}`;
    case "BinaryTypeOperation":
    case "BooleanLiteral":
    case "NumberLiteral":
    case "PrefixUnaryTypeOperation":
    case "StringLiteral":
      return "UNIMPLEMENTED";
    default:
      throw exhaustive(node);
  }
}
