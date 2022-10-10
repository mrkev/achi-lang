import Parsimmon from "parsimmon";
import { Context, ScopeError } from "../interpreter/Context";
import { niceError } from "../interpreter/interpreter";
import { exhaustive } from "../interpreter/nullthrows";
import { System } from "../interpreter/runtime/System";
import { LangType, tryParse } from "../parser/parser";
import { typeOf, isSubtype, Type, printType } from "./types";

export function check(
  script: string | LangType["Program"],
  context: Context = Context.create(), // should I make a special "type context"?
  system: System
): void {
  try {
    const ast = typeof script === "string" ? tryParse(script) : script;
    context.pushScope();
    checkStatements(ast.statements, context);
    context.popScope();
  } catch (e) {
    if (e instanceof ScopeError) {
      if (typeof script === "string") {
        const nice = niceError(script, e);
        system.console.log(nice);
      }
    } else if (e instanceof TypeMismatchError) {
      if (typeof script === "string") {
        const nice = niceError(script, e);
        system.console.log(nice);
      }
    } else if (e instanceof Error || typeof e === "string") {
      system.console.log(e);
    } else {
      console.log("Unknown error type during interpretation");
    }
    console.error(e);
  }
}

function checkStatements(
  statements: LangType["Statement"][],
  context: Context
): void {
  for (const statement of statements) {
    const { kind } = statement;
    switch (kind) {
      // if (x == 3) { ... }
      case "IfStatement": {
        // 1: guard must be boolean
        const guardType = typeOf(statement.guard, context);
        if (!isSubtype(guardType, { kind: "boolean" })) {
          throw new TypeMismatchError(
            statement.guard,
            { kind: "boolean" },
            guardType
          );
        }
      }

      case "NamedRecordDefinitionStatement":
      case "NamedRecordDefinitionGroup":
      case "ConstantDefinition":
      case "DEBUG_Log":
      case "DEBUG_LogType":
      case "ReturnStatement":
      case "FunctionCall":
      case "MatchFunction":
      case "MatchExpression":
        throw new Error("Not implemented");
      default: {
        throw exhaustive(kind);
      }
    }
  }
}

function checkExpression(
  expression: LangType["Expression"],
  context: Context
): void {}

export class TypeMismatchError {
  expression: LangType["Expression"];
  expected: Type;
  got: Type;
  constructor(expression: LangType["Expression"], expected: Type, got: Type) {
    this.expression = expression;
    this.expected = expected;
    this.got = got;
  }

  location(): Readonly<{ start: Parsimmon.Index; end: Parsimmon.Index }> {
    const loc = {
      offset: 0,
      line: 1,
      column: 1,
    };
    return { start: loc, end: loc };
  }

  print(): string {
    return `Invalid type. Expected ${printType(
      this.expected
    )} but got ${printType(this.got)}.`;
  }
}
