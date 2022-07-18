import { LangType } from "../parser/parser";
import { Value, NamedRecordInstance } from "./interpreter";
import { exhaustive } from "./nullthrows";
import { Context } from "./Context";

export function evaluateExpression(
  expression: LangType["Expression"],
  context: Context
): Value {
  const { kind } = expression;
  switch (kind) {
    case "Identifier": {
      const foundValue = context.values().get(expression.value);
      if (!foundValue) {
        throw new Error(`Name ${expression.value} not found`);
      }
      return foundValue;
    }

    case "NamedRecordLiteral": {
      const instance = NamedRecordInstance.fromNamedRecordLiteral(
        expression,
        context
      );
      return { kind: "NamedRecord", value: instance };
    }

    case "NumberLiteral": {
      return { kind: "number", value: expression.value };
    }

    case "RecordLiteral": {
      throw new Error("Not implemented; RecordLiteral evaluation");
    }

    case "StringLiteral": {
      return { kind: "string", value: expression.value };
      // throw new Error("Not implemented; StringLiteral evaluation");
    }

    case "FunctionDefinition": {
      throw new Error("Not implemented; FunctionDefinition evaluation");
    }

    default:
      throw exhaustive(kind);
  }
}
