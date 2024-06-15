import { exhaustive } from "./nullthrows";
import { ValueType } from "./runtime/value";

export function stringOfValue(value: ValueType["Value"]): string {
  return String(printableOfValue(value));
}

type ValueOrArray<T> = T | Array<ValueOrArray<T>>;

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
      return `[Function: ${value.identifier}]`;
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
      return "<anonymous function>";
    }

    case "nil": {
      return null;
    }

    default:
      throw exhaustive(kind);
  }
}
