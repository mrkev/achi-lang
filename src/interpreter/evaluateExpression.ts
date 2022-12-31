import { LangType } from "../parser/parser";
import { Value } from "./value";
import { exhaustive, nullthrows } from "./nullthrows";
import { Context, ScopeError } from "./Context";
import { evaluateStatements } from "./evaluateStatements";
import { System } from "./runtime/System";
import {
  NamedRecordInstance,
  NamedRecordKlass,
  RecordLiteralInstance,
} from "./runtime/runtime.records";
import { evaluateMatch } from "./runtime/runtime.match";
import { AnonymousFunctionInstance } from "./runtime/runtime.functions";
import {
  evaluateUnaryExpression,
  evaluateBinaryExpression,
} from "./evaluateOperations";

export function evaluateExpression(
  expression: LangType["RecordLiteral"],
  context: Context,
  system: System
): { kind: "RecordLiteralInstance"; value: RecordLiteralInstance };
export function evaluateExpression(
  expression: LangType["Expression"],
  context: Context,
  system: System
): Value;
export function evaluateExpression(
  expression: LangType["Expression"],
  context: Context,
  system: System
): Value {
  const { kind } = expression;
  switch (kind) {
    // foo
    case "ValueIdentifier": {
      const foundValue = context.valueScope.get(
        expression.value,
        `Identifier "${expression.value}" not found (at ${expression._meta.start.line}:${expression._meta.start.column})`
      );

      if (foundValue instanceof ScopeError) {
        throw foundValue;
      }

      return foundValue;
    }

    // Point(x: 3, y: 4)
    case "NamedRecordLiteral": {
      const namedRecordKlass = context.getTypeOrThrow(expression.identifier);
      if (!(namedRecordKlass instanceof NamedRecordKlass)) {
        throw new Error(
          `Type ${namedRecordKlass} is not a named record definition`
        );
      }

      // TODO: typecheck
      // konstructor.valueSpec

      const recordLiteral = evaluateExpression(
        expression.recordLiteral,
        context,
        system
      );

      const instance = new NamedRecordInstance(
        expression,
        namedRecordKlass,
        recordLiteral.value
      );

      return { kind: "NamedRecordInstance", value: instance };
    }

    case "NumberLiteral": {
      return { kind: "number", value: expression.value };
    }

    case "BooleanLiteral": {
      return { kind: "boolean", value: expression.value };
    }

    case "RecordLiteral": {
      const props = new Map<string, Value>();
      for (const def of expression.definitions) {
        const childExpression = def.expression;
        const value = evaluateExpression(childExpression, context, system);
        // TODO: ensure no duplicate identifiers
        props.set(def.identifier.value, value);
      }

      const instance = new RecordLiteralInstance(expression, props);
      return { kind: "RecordLiteralInstance", value: instance };
    }

    case "StringLiteral": {
      return { kind: "string", value: expression.value };
    }

    case "FunctionCall": {
      const { identifier, argument } = expression;

      const funcInstance = context.valueScope.get(
        identifier.value,
        `No definition for function ${identifier.value}`
      );

      if (funcInstance instanceof ScopeError) {
        throw funcInstance;
      }

      // TODO: other function types
      const instKind = funcInstance.kind;
      if (
        instKind !== "MatchFunctionInstance" &&
        instKind !== "AnonymousFunctionInstance"
      ) {
        throw new Error(
          `${identifier.value} is a ${funcInstance.kind}, not a function`
        );
      }
      const argumentValue = evaluateExpression(argument, context, system);
      funcInstance.value.ast.block;

      return callFunction(
        funcInstance.value.ast,
        argumentValue,
        context,
        system
      );
    }

    case "MatchExpression": {
      const value = evaluateExpression(expression.expression, context, system);
      const result = evaluateMatch(value, expression.block, context, system);
      return result;
    }

    case "MapLiteral": {
      throw new Error("Not implemented, MapLiteral");
    }

    case "ListLiteral": {
      throw new Error("Not implemented, ListLiteral");
    }

    case "AnonymousFunctionLiteral": {
      const func = new AnonymousFunctionInstance(expression);
      return { kind: "AnonymousFunctionInstance", value: func };
    }

    // Unary
    case "UnaryOperation": {
      return {
        kind: "number",
        value: evaluateUnaryExpression(expression, context, system),
      };
    }

    case "BinaryOperation": {
      return evaluateBinaryExpression(expression, context, system);
    }

    default: {
      throw exhaustive(kind);
    }
  }
}

function callFunction(
  func: LangType["MatchFunction"] | LangType["AnonymousFunctionLiteral"],
  argument: Value,
  context: Context,
  system: System
): Value {
  if (func.kind === "AnonymousFunctionLiteral") {
    context.valueScope.push();
    // TODO: add argument values to context, do when I implement destructuring
    const result = evaluateStatements(func.block.statements, context, system);
    context.valueScope.pop();
    return nullthrows(result, "fixme, case block returns nothing");
  }

  if (func.kind === "MatchFunction") {
    // TODO: test types
    // TODO: ensure pattern is exhaustive, so we don't have to worry about that here
    // TODO: just executing first case for now

    for (const caseEntry of func.block.caseEntries) {
      // caseEntry.guard
      context.valueScope.push();
      const result = evaluateStatements(
        caseEntry.block.statements,
        context,
        system
      );
      context.valueScope.pop();
      return nullthrows(result, "fixme, case block returns nothing");
    }

    throw new Error("fixme, no case blocks");
  }

  throw exhaustive(func);
}
