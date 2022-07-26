import { LangType, tryParse } from "../parser/parser";
import { Context } from "./Context";
import { System } from "./System";
import { exhaustive, nullthrows } from "./nullthrows";
import { evaluateStatements } from "./evaluateStatements";
import {
  NamedRecordKlass,
  RecordLiteralInstance,
  NamedRecordDefinitionGroupInstance,
  NamedRecordInstance,
} from "./runtime/runtime.records";
import { MatchFunctionInstance } from "./runtime/runtime.match";

export function interpret(
  script: string | LangType["Program"],
  system: System = new System(),
  context: Context = Context.create()
): void {
  try {
    const ast = typeof script === "string" ? tryParse(script) : script;
    context.pushScope();
    evaluateStatements(ast.statements, context, system);
    context.popScope();
  } catch (e) {
    system.console.log(e as Error);
    console.error(e);
  }
}

export type Value =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "empty"; value: null }
  | { kind: "NamedRecordInstance"; value: NamedRecordInstance }
  | { kind: "MatchFunctionInstance"; value: MatchFunctionInstance }
  | { kind: "NamedRecordKlass"; value: NamedRecordKlass }
  | { kind: "RecordLiteralInstance"; value: RecordLiteralInstance }
  | {
      kind: "NamedRecordDefinitionGroupInstance";
      value: NamedRecordDefinitionGroupInstance;
    };

export function stringOfValue(value: Value): string {
  const { kind } = value;
  switch (kind) {
    case "number":
    case "string":
    case "boolean": {
      return String(value.value);
    }
    case "NamedRecordInstance": {
      let str = value.value.konstructor.classname + " {";
      const entries = [...value.value.recordLiteral.props.entries()];
      if (entries.length > 0) {
        str += "\n";
      }
      for (const [key, val] of entries) {
        str += `  ${key}: ${stringOfValue(
          val
        )} (${value.value.konstructor.valueSpec.get(key)})\n`;
      }
      str += "}";
      return str;
    }

    case "MatchFunctionInstance": {
      return `[Function: ${value.value.identifier}]`;
    }

    case "NamedRecordKlass": {
      return `[Class: ${value.value.classname}]`;
    }

    case "RecordLiteralInstance": {
      return "todo RecordLiteral";
      // let str = "";
      // for (const [key, val] of value.value.ast.definitions.) {
      //   str += `  ${key}: ${stringOfValue(
      //     val
      //   )} (${value.value.konstructor.valueSpec.get(key)})\n`;
      // }
      // str += "}";
    }

    case "NamedRecordDefinitionGroupInstance": {
      return `[classes: ${value.value.ast.identifier.value} (${value.value.ast.namedRecordDefinitions.length} classes)]`;
    }

    case "empty": {
      return "null";
    }

    default:
      throw exhaustive(kind);
  }
}

function resolveTypeIdentifier(
  identifier: LangType["TypeIdentifier"] | LangType["NestedTypeIdentifier"],
  context: Context
) {
  // TODO: implement
  const { kind } = identifier;
  switch (kind) {
    case "TypeIdentifier": {
      return identifier.value;
    }

    case "NestedTypeIdentifier": {
      return nullthrows(
        identifier.path[identifier.path.length - 1]?.value,
        "parser error: parser should ensure NestedTypeIdentifier is never of length < 2"
      );
    }
  }
}
