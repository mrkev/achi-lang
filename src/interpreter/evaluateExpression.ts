import { LangType } from "../parser/parser";
import { Value, NamedRecordInstance } from "./interpreter";
import { exhaustive, nullthrows } from "./nullthrows";
import { Context } from "./Context";
import { evaluateStatements } from "./evaluateStatements";
import { System } from "./System";
import { RecordLiteralInstance } from "./runtime/NamedRecordConstructor";

export function evaluateExpression(
  expression: LangType["Expression"],
  context: Context,
  system: System
): Value {
  const { kind } = expression;
  switch (kind) {
    case "ValueIdentifier": {
      const foundValue = context.values().get(expression.value);
      if (!foundValue) {
        throw new Error(`Name ${expression.value} not found`);
      }
      return foundValue;
    }

    case "NamedRecordLiteral": {
      system.console.log("->NamedRecordLiteral");
      const instance = NamedRecordInstance.fromNamedRecordLiteral(
        expression,
        context,
        system
      );
      return { kind: "NamedRecord", value: instance };
    }

    case "NumberLiteral": {
      return { kind: "number", value: expression.value };
    }

    case "RecordLiteral": {
      system.console.log("->RecordLiteral");
      const props = new Map<string, Value>
      for (const def of expression.definitions) {
        const value = evaluateExpression(def.expression, context, system)
        // TODO: ensure no duplicate identifiers
        props.set(def.identifier.value, value)
      }

      const instance = new RecordLiteralInstance(expression, props)
      return {kind: "RecordLiteralInstance", value: instance}
    }

    case "StringLiteral": {
      return { kind: "string", value: expression.value };
      // throw new Error("Not implemented; StringLiteral evaluation");
    }

    case "FunctionDefinition": {
      throw new Error("Not implemented; FunctionDefinition evaluation");
    }

    case "FunctionCall": {
      const { identifier, argument } = expression;

      const funcInstance = context
        .values()
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

    default:
      throw exhaustive(kind);
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
    const result = evaluateStatements(
      caseEntry.block.statements,
      context,
      system
    );
    return nullthrows(result, "fixme, case block returns nothing");
  }

  throw new Error("fixme, no case blocks");
}
