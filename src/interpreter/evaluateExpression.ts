import { LangType } from "../parser/parser";
import { Context, Value, NamedRecordInstance, exhaustive } from "./interpreter";

export function evaluateExpression(
  expression: LangType["Expression"],
  context: Context
): Value {
  const { kind } = expression;

  switch (kind) {
    case "Identifier": {
      const foundValue = context.values.get(expression.value);
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
    default:
      throw exhaustive(kind);
  }
}
