import { LangType } from "./parser";
import {
  OperatorParser,
  BinaryOperation,
  UnaryOperation,
  OperatableExpression,
} from "./parser.binex";
import { sublang } from "./sublang";

export type LangType_BinOp = {
  OperationExpression: BinaryOperation | UnaryOperation | OperatableExpression;
};

/**
 * Defines unary and binary operations
 */
export const LangDef_BinOp = sublang<LangType, LangType_BinOp>({
  OperationExpression: OperatorParser,
});
