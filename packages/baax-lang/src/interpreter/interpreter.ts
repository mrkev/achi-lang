import { TypeMismatchError } from "../checker/checker";
import { LangType, tryParse } from "../parser/parser";
import { Context } from "./Context";
import { evaluateStatements } from "./evaluateStatements";
import { ScopeError, ScriptError } from "./interpreterErrors";
import { globalScope } from "./runtime/runtime.globals";
import { System } from "./runtime/System";

// // Importing and exporting makes this easier, can define things in the lang itself
// function populateGlobalScope(context: Context) {
//   context.valueScope.define('log', )
// }

export function interpret(
  script: string | LangType["Program"],
  system: System = new System(),
  context: Context = Context.create(),
  options?: {
    quietConsoleError?: boolean;
  }
): Context {
  try {
    const ast = typeof script === "string" ? tryParse(script) : script;
    context.valueScope.push(globalScope());
    // populateGlobalScope(context);
    evaluateStatements(ast.statements, context, system);
    // NOTE: we don't pop this top-level Scope, because we want to return the
    // final context. When we implement `export const ...` we can pop it, since
    // we will have saved exported values in a separate list and it's probably
    // what we want
    // context.valueScope.pop();
  } catch (e) {
    if (e instanceof ScopeError) {
      if (typeof script === "string") {
        const nice = niceError(script, e);
        console.log("nice");
        system.console.log(nice);
      }
    } else if (e instanceof ScriptError) {
      system.console.fail(e);
    } else if (e instanceof Error) {
      system.console.fail(e);
    } else if (typeof e === "string") {
      system.console.fail(new Error(e));
    } else {
      system.console.fail(
        new Error("Unknown error type during interpretation")
      );
      console.error(e);
    }

    const quietConsoleErr = options?.quietConsoleError === true;
    if (!quietConsoleErr) {
      console.error(e);
    }
  }
  return context;
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
  msg.push(error.message);
  return msg.join("\n");
}

// function resolveTypeIdentifier(
//   identifier: LangType["TypeIdentifier"] | LangType["NestedTypeIdentifier"],
//   context: Context
// ) {
//   // TODO: implement
//   const { kind } = identifier;
//   switch (kind) {
//     case "TypeIdentifier": {
//       return identifier.value;
//     }

//     case "NestedTypeIdentifier": {
//       return nullthrows(
//         identifier.path[identifier.path.length - 1]?.value,
//         "parser error: parser should ensure NestedTypeIdentifier is never of length < 2"
//       );
//     }
//   }
// }
