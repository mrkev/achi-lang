import { LangType } from "../../parser/parser";
import { Context } from "../Context";
import { evaluateStatements } from "../evaluateStatements";
import { Value } from "../interpreter";
import { exhaustive, nullthrows } from "../nullthrows";
import { System } from "../System";
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

// export class MatchExpressionInstance {
//   ast: LangType["MatchExpression"];
//   constructor(ast: LangType["MatchExpression"]) {
//     this.ast = ast;
//   }
// }

export function evaluateMatch(
  value: Value,
  cases: LangType["BlockOfCases"],
  context: Context,
  system: System
): Value {
  for (const caseEntry of cases.caseEntries) {
    const guardExpression = caseEntry.guard;
    // TODO: bindings!!!
    if (isMatch(value, guardExpression, context)) {
      const result = evaluateStatements(
        caseEntry.block.statements,
        context,
        system
      );
      return result ?? { kind: "empty", value: null };
    }
  }
  // TODO runtime or static checks for completeness
  throw new Error("fixme, no case blocks");
}

function isMatch(
  value: Value,
  expression: LangType["Expression"],
  context: Context
): boolean {
  const { kind } = expression;
  switch (kind) {
    // an identifier matches with anything
    case "ValueIdentifier": {
      return true;
    }

    case "StringLiteral": {
      return value.kind === "string";
    }

    case "NumberLiteral": {
      return value.kind === "number";
    }

    // TODO: TEST TEST TEST
    case "RecordLiteral": {
      if (value.kind !== "RecordLiteralInstance") {
        return false;
      }

      const instace = value.value;
      const instanceKeys = [...instace.props.keys()];
      const literalKeys = expression.definitions.map(
        (def) => def.identifier.value
      );

      if (!aSubsetB(literalKeys, instanceKeys)) {
        return false;
      }

      for (const pattern of expression.definitions) {
        const key = pattern.identifier.value;
        const childVal = nullthrows(
          instace.props.get(key),
          "should never happen, because we ensured patternKeys is a subset of instanceKeys above"
        );

        if (!isMatch(childVal, pattern.expression, context)) {
          return false;
        }
      }

      return true;
    }
    case "NamedRecordLiteral": {
      if (value.kind !== "NamedRecordInstance") {
        return false;
      }

      const valueToMatch = value.value;
      const patternKlass = context.getTypeOrThrow(expression.identifier);

      // todo: double check that this handles not matching on class groups in the way I want it to
      if (valueToMatch.konstructor !== patternKlass) {
        return false;
      }

      return isMatch(
        {
          kind: "RecordLiteralInstance",
          value: valueToMatch.recordLiteral,
        },
        expression.recordLiteral,
        context
      );
    }

    case "MatchExpression":
    case "FunctionCall":
    case "FunctionDefinition": {
      throw new Error(`Can't pattern match using expression of type ${kind}`);
      break;
    }

    default: {
      throw exhaustive(kind);
    }
  }
}

/** is A a subset of B */
function aSubsetB(a: string[], b: string[]) {
  if (a.length > b.length) {
    return false;
  }

  const bset = new Set(b);
  for (const akey of a) {
    if (!bset.has(akey)) {
      return false;
    }
  }

  return true;
}
