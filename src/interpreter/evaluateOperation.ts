import { boolean, expectBoolean, Value } from "./value";
import { Context } from "./Context";
import { System } from "./runtime/System";
import {
  BinaryOperation,
  PrefixUnaryOperation,
  SuffixUnaryOperation,
} from "../parser/parser.binex";
import { factorial } from "./runtime/utils";
import { expectNumber, expectString, number, string } from "./value";
import { evaluateExpression } from "./evaluateExpression";
import { exhaustive } from "./nullthrows";

export function evaluatePrefixUnaryExpression(
  unex: PrefixUnaryOperation,
  context: Context,
  system: System
): Value {
  const value = evaluateExpression(unex.value, context, system) as Value;

  switch (unex.operator) {
    case "-":
      return number(-expectNumber(value).value);
    case "!":
      return boolean(!expectBoolean(value).value);
    default:
      exhaustive(unex.operator);
      throw new Error("unknown operator " + unex.operator);
  }
}

export function evaluateSuffixUnaryExpression(
  unex: SuffixUnaryOperation,
  context: Context,
  system: System
): Value {
  const value = evaluateExpression(unex.value, context, system) as Value;
  switch (unex.operator) {
    case "!":
      return number(factorial(expectNumber(value).value));
    default:
      exhaustive(unex.operator);
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
    case "/":
      return number(expectNumber(left).value / expectNumber(right).value);
    default:
      exhaustive(binex.operator);
      throw new Error("unknown operator " + binex.operator);
  }
}
