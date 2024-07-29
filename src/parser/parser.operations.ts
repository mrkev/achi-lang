import { LangType } from "./parser";
import {
  BinaryOperation,
  OperatableExpression,
  OperatorParser,
  PrefixUnaryOperation,
  SuffixUnaryOperation,
} from "./parser.binex";
import { sublang } from "./sublang";

export type LangType_BinOp = {
  OperationExpression:
    | OperatableExpression
    | PrefixUnaryOperation
    | SuffixUnaryOperation
    | BinaryOperation;
};

/**
 * Defines unary and binary operations
 */
export const LangDef_BinOp = sublang<LangType, LangType_BinOp>({
  OperationExpression: OperatorParser,
});
