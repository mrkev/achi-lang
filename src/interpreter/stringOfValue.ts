import { exhaustive } from "../nullthrows";
import { LangType } from "../parser/parser";
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
        str += `  ${key}: ${stringOfValue(
          val
        )} (${value.konstructor.valueSpec.get(key)})\n`;
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
      return `${stringOfAst(value.ast.argument)}`;
    }

    case "nil": {
      return null;
    }

    default:
      throw exhaustive(kind);
  }
}

function stringOfAst(
  node: LangType["RecordDefinition"] | LangType["NamedDefinition"]
): string {
  switch (node.kind) {
    case "NamedDefinition":
      return `${node.identifier.value}: ${node.typeTag.identifier.value}`;
    case "RecordDefinition":
      return `(${node.definitions.map(stringOfAst).join(", ")}) => <unknown>`;
    default:
      throw exhaustive(node);
  }
}
