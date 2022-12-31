import { Value } from "./value";
import { Context } from "./Context";
import { System } from "./runtime/System";
import { BinaryOperation, UnaryOperation } from "../parser/parser.binex";
import { factorial } from "./runtime/utils";
import { expectNumber, expectString, number, string } from "./value";
import { evaluateExpression } from "./evaluateExpression";

export function evaluateUnaryExpression(
  unex: UnaryOperation,
  context: Context,
  system: System
): number {
  const value = expectNumber(
    evaluateExpression(unex.value, context, system) as Value
  ).value;

  switch (unex.operator) {
    case "-":
      return -value;
    case "!":
      return factorial(value);
    case "*":
    case "+":
    case "^":
      throw new Error("invalid unary operator " + unex.operator);
    default:
      throw new Error("unknown operator " + unex.operator);
  }
}

export function evaluateBinaryExpression(
  binex: BinaryOperation,
  context: Context,
  system: System
): Value {
  const left = evaluateExpression(binex.left, context, system) as Value;
  const right = evaluateExpression(binex.right, context, system) as Value;

  switch (binex.operator) {
    case "*": {
      return number(expectNumber(left).value * expectNumber(right).value);
    }
    case "+": {
      switch (left.kind) {
        case "number": {
          const result = expectNumber(left).value + expectNumber(right).value;
          return number(result);
        }
        case "string": {
          const result = expectString(left).value + expectString(right).value;
          return string(result);
        }
        default:
          throw new Error("UNEXPECTED VALUE FOR BINOP " + left.kind);
      }
    }
    case "-":
      return number(expectNumber(left).value - expectNumber(right).value);
    case "^": {
      return number(
        Math.pow(expectNumber(left).value, expectNumber(right).value)
      );
    }
    case "!":
      throw new Error("invalid binary operator " + binex.operator);
    default:
      throw new Error("unknown operator " + binex.operator);
  }
}
