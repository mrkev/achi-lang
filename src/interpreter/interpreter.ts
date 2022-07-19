import { LangType, tryParse } from "../parser/parser";
import { evaluateExpression } from "./evaluateExpression";
import { Context } from "./Context";
import { System } from "./System";
import { exhaustive, nullthrows } from "./nullthrows";
import { evaluateStatements } from "./evaluateStatements";
import {
  NamedRecordKlass,
  RecordLiteralInstance,
} from "./runtime/NamedRecordConstructor";
import { MatchFunctionInstance } from "./runtime/MatchFunctionInstance";

export function interpret(
  script: string | LangType["Program"],
  system: System = new System(),
  context: Context = Context.create()
): void {
  try {
    const ast = typeof script === "string" ? tryParse(script) : script;
    evaluateStatements(ast.statements, context, system);
  } catch (e) {
    system.console.log(e as Error);
    console.error(e);
  }
}

export class NamedRecordInstance {
  readonly konstructor: NamedRecordKlass;
  readonly props: Map<string, Value>;
  constructor(konstructor: NamedRecordKlass, props: Map<string, Value>) {
    this.konstructor = konstructor;
    this.props = props;
  }

  static fromNamedRecordLiteral(
    expression: LangType["NamedRecordLiteral"],
    context: Context,
    system: System
  ) {
    // if (!context.types.has(expression.identifier.value)) {
    //   throw new Error(`No definition for ${expression.identifier.value} found`);
    // }

    const identifierValue = resolveTypeIdentifier(
      expression.identifier,
      context
    );

    const konstructor = context.types.get(identifierValue);
    if (!(konstructor instanceof NamedRecordKlass)) {
      throw new Error(`Type ${identifierValue} is not a named record`);
    }

    // TODO: typecheck
    // konstructor.valueSpec

    const props = new Map();
    for (const def of expression.recordLiteral.definitions) {
      props.set(
        def.identifier.value,
        evaluateExpression(def.expression, context, system)
      );
    }

    const instance = new NamedRecordInstance(konstructor, props);
    return instance;
  }
}

export type Value =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "NamedRecord"; value: NamedRecordInstance }
  | { kind: "MatchFunctionInstance"; value: MatchFunctionInstance }
  | { kind: "NamedRecordKlass"; value: NamedRecordKlass }
  | { kind: "RecordLiteralInstance"; value: RecordLiteralInstance };

export function stringOfValue(value: Value): string {
  const { kind } = value;
  switch (kind) {
    case "number":
    case "string":
    case "boolean": {
      return String(value.value);
    }
    case "NamedRecord": {
      let str = value.value.konstructor.classname + " { \n";
      for (const [key, val] of value.value.props.entries()) {
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
