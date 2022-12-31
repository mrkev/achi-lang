import { LangType } from "../../parser/parser";
import { Context } from "../Context";
import { evaluateStatements } from "../evaluateStatements";
import { Value } from "../value";
import { exhaustive, nullthrows } from "../nullthrows";
import { System } from "./System";
import { aSubsetB } from "./utils";
import { NamedRecordKlass, RecordLiteralInstance } from "./runtime.records";

// ie, function print matches Card
export class MatchFunctionInstance {
  ast: LangType["MatchFunction"];
  get identifier(): string {
    return this.ast.identifier.value;
  }

  constructor(ast: LangType["MatchFunction"]) {
    this.ast = ast;
  }
}

export function evaluateMatch(
  value: Value,
  cases: LangType["BlockOfCases"],
  context: Context,
  system: System
): Value {
  for (const caseEntry of cases.caseEntries) {
    const guardExpression = caseEntry.guard;
    // TODO: bindings!!!
    const matchResult = doMatch(value, guardExpression, context);
    if (matchResult.isMatch) {
      context.valueScope.push();
      context.valueScope.setAll(matchResult.bindings);
      const result = evaluateStatements(
        caseEntry.block.statements,
        context,
        system
      );
      context.valueScope.pop();
      return result ?? { kind: "empty", value: null };
    }
  }
  // TODO runtime or static checks for completeness
  throw new Error("fixme, no case blocks");
}

function doMatch(
  value: Value,
  expression: LangType["Expression"],
  context: Context
  // todo, new context instead of bindings array?
):
  | Readonly<{ isMatch: false }>
  | Readonly<{ isMatch: true; bindings: Array<[string, Value]> }> {
  switch (expression.kind) {
    // an identifier matches with anything
    case "ValueIdentifier": {
      return { isMatch: true, bindings: [[expression.value, value]] };
    }

    case "StringLiteral": {
      const isMatch =
        value.kind === "string" && value.value === expression.value;
      return isMatch ? { isMatch, bindings: [] } : { isMatch };
    }

    case "NumberLiteral": {
      const isMatch =
        value.kind === "number" && value.value === expression.value;
      return isMatch ? { isMatch, bindings: [] } : { isMatch };
    }

    case "BooleanLiteral": {
      const isMatch =
        value.kind === "boolean" && value.value === expression.value;
      return isMatch ? { isMatch, bindings: [] } : { isMatch };
    }

    // Card.Number(value: value)
    case "NamedRecordLiteral": {
      if (value.kind !== "NamedRecordInstance") {
        return { isMatch: false };
      }

      const valueToMatch = value.value;
      const patternKlass = context.getTypeOrThrow(expression.identifier);

      // todo: double check that this handles not matching on class groups in the way I want it to
      if (valueToMatch.konstructor !== patternKlass) {
        return { isMatch: false };
      }

      return doMatch(
        {
          kind: "RecordLiteralInstance",
          value: valueToMatch.recordLiteral,
        },
        expression.recordLiteral,
        context
      );
    }

    // TODO: TEST TEST TEST
    case "RecordLiteral": {
      if (value.kind !== "RecordLiteralInstance") {
        return { isMatch: false };
      }

      const instace = value.value;
      const instanceKeys = [...instace.props.keys()];
      const literalKeys = expression.definitions.map(
        (def) => def.identifier.value
      );

      if (!aSubsetB(literalKeys, instanceKeys)) {
        return { isMatch: false };
      }

      // TODO: error on overrides, would be better at eval time than only if
      // the pattern matches (current behaviour).
      // Would be even better at typechecking time acutally btw
      const bindings = [];
      for (const pattern of expression.definitions) {
        const key = pattern.identifier.value;
        const childVal = nullthrows(
          instace.props.get(key),
          "should never happen, because we ensured patternKeys is a subset of instanceKeys above"
        );

        const matchResult = doMatch(childVal, pattern.expression, context);
        if (matchResult.isMatch) {
          bindings.push(...matchResult.bindings);
        } else {
          return { isMatch: false };
        }
      }

      return { isMatch: true, bindings: bindings };
    }

    case "MatchExpression":
    case "FunctionCall":
    case "ListLiteral":
    case "MapLiteral":
    case "PrefixUnaryOperation":
    case "SuffixUnaryOperation":
    case "BinaryOperation":
    // case "FunctionDefinition":
    case "AnonymousFunctionLiteral": {
      throw new Error(
        `Can't pattern match using expression of type ${expression.kind}`
      );
    }

    default: {
      throw exhaustive(expression);
    }
  }
}
