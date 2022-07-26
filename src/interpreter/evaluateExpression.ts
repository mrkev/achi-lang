import { LangType } from "../parser/parser";
import { Value } from "./interpreter";
import { exhaustive, nullthrows } from "./nullthrows";
import { Context } from "./Context";
import { evaluateStatements } from "./evaluateStatements";
import { System } from "./System";
import {
  NamedRecordInstance,
  NamedRecordKlass,
  RecordLiteralInstance,
} from "./runtime/runtime.records";
import { evaluateMatch } from "./runtime/runtime.match";

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
    case "ValueIdentifier": {
      const foundValue = context
        .valueScope()
        .getOrThrow(expression.value, `Name ${expression.value} not found`);
      return foundValue;
    }

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
      // throw new Error("Not implemented; StringsLiteral evaluation");
    }

    case "FunctionDefinition": {
      throw new Error("Not implemented; FunctionDefinition evaluation");
    }

    case "FunctionCall": {
      const { identifier, argument } = expression;

      const funcInstance = context
        .valueScope()
        .getOrThrow(
          identifier.value,
          `No definition for function ${identifier.value}`
        );

      // TODO: other function types
      const instKind = funcInstance.kind;
      if (instKind !== "MatchFunctionInstance") {
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

    default: {
      throw exhaustive(kind);
    }
  }
}

function callFunction(
  func: LangType["MatchFunction"],
  argument: Value,
  context: Context,
  system: System
): Value {
  // TODO: handle different types of function
  // TODO: test types
  // TODO: just executing first case for now

  for (const caseEntry of func.block.caseEntries) {
    // caseEntry.guard
    context.pushScope();
    const result = evaluateStatements(
      caseEntry.block.statements,
      context,
      system
    );
    context.popScope();
    return nullthrows(result, "fixme, case block returns nothing");
  }

  throw new Error("fixme, no case blocks");
}
