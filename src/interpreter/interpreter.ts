import { LangType, tryParse } from "../parser/parser";
import { Context, ScopeError } from "./Context";
import { System } from "./runtime/System";
import { exhaustive, nullthrows } from "./nullthrows";
import { evaluateStatements } from "./evaluateStatements";
import {
  NamedRecordKlass,
  RecordInstance,
  NamedRecordDefinitionGroupInstance,
  NamedRecordInstance,
} from "./runtime/runtime.records";
import { MatchFunctionInstance } from "./runtime/runtime.match";
import { AnonymousFunctionInstance } from "./runtime/runtime.functions";
import { TypeMismatchError } from "../checker/checker";
import { Value } from "./value";

export function interpret(
  script: string | LangType["Program"],
  system: System = new System(),
  context: Context = Context.create(),
  options?: {
    quietConsoleError?: boolean;
  }
): void {
  try {
    const ast = typeof script === "string" ? tryParse(script) : script;
    context.valueScope.push();
    evaluateStatements(ast.statements, context, system);
    context.valueScope.pop();
  } catch (e) {
    if (e instanceof ScopeError) {
      if (typeof script === "string") {
        const nice = niceError(script, e);
        console.log("nice");
        system.console.log(nice);
      }
    } else if (e instanceof Error || typeof e === "string") {
      system.console.log(e);
    } else {
      console.log("Unknown error type during interpretation");
    }
    const quietConsoleErr = options?.quietConsoleError === true;
    if (!quietConsoleErr) {
      console.error(e);
    }
  }
}

export function niceError(
  script: string,
  error: ScopeError | TypeMismatchError
) {
  const lines = script.split("\n");
  const numLineDigits = lines.length.toString().length;
  const startLine = error.location().start.line - 1; // make it 0 indexed
  const lineNum = (num: number) =>
    (num - 1).toString().padStart(numLineDigits + 1);

  const msg = [];
  if (startLine > 0) {
    msg.push(`${lineNum(startLine + 1)}| ${lines[startLine - 1]}`);
  }
  msg.push(`${lineNum(startLine + 2)}| ${lines[startLine]}`);
  msg.push(
    "".padStart(numLineDigits + 1) +
      "  " +
      "^".padStart(error.location().end.column - 1)
  );
  if (lines.length > startLine) {
    msg.push(`${lineNum(startLine + 3)}| ${lines[startLine + 1]}`);
  }
  msg.push("");
  msg.push(error.print());
  return msg.join("\n");
}

export function stringOfValue(value: Value): string {
  const { kind } = value;
  switch (kind) {
    case "number":
    case "string":
    case "boolean": {
      // console.log(value.value, "to string", String(value.value));
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

    case "RecordInstance": {
      // return "todo RecordLiteral";
      let str = "(\n";
      for (const [key, val] of value.value.props.entries()) {
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
      return `[classes: ${value.value.ast.identifier.value} (${value.value.ast.namedRecordDefinitions.length} classes)]`;
    }

    case "AnonymousFunctionInstance": {
      return "<anonymous function>";
    }

    case "nil": {
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
