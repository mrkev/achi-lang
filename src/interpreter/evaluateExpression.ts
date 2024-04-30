import { LangType } from "../parser/parser";
import {
  boolean,
  list,
  number,
  RecordInstance,
  record,
  string,
  Value,
  valueOfJavascriptValue,
} from "./runtime/value";
import { exhaustive, nullthrows } from "./nullthrows";
import { Context } from "./Context";
import {
  evaluateStatements,
  evaluateWithScope,
  ReturnInterrupt,
} from "./evaluateStatements";
import { System } from "./runtime/System";
import {
  NamedRecordInstance,
  NamedRecordKlass,
} from "./runtime/runtime.namedrecords";
import { evaluateMatch } from "./runtime/runtime.match";
import {
  AnonymousFunctionInstance,
  MatchFunctionInstance,
} from "./runtime/runtime.functions";
import {
  evaluateBinaryExpression,
  evaluateSuffixUnaryExpression,
  evaluatePrefixUnaryExpression,
} from "./evaluateOperation";
import { nil } from "./runtime/value";
import { ScopeError } from "./interpreterErrors";
import { stringOfValue } from "./interpreter";
import { expectString } from "./runtime/value";

export function evaluateExpression(
  expression: LangType["RecordLiteral"],
  context: Context,
  system: System
): RecordInstance;
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
    // foo
    case "ValueIdentifier": {
      const foundValue = context.valueScope.get(
        expression.value,
        `Identifier "${expression.value}" not found (at ${expression["@"].start.line}:${expression["@"].start.column})`
      );

      if (foundValue instanceof ScopeError) {
        throw foundValue;
      }

      return foundValue;
    }

    // Point(x: 3, y: 4)
    case "NamedRecordLiteral": {
      const namedRecordKlass = context.getTypeOrThrow(expression.identifier);
      if (!(namedRecordKlass instanceof NamedRecordKlass)) {
        throw new Error(
          `Type ${namedRecordKlass} is not a named record definition`
        );
      }

      // TODO: typecheck
      // konstructor.valueSpec

      const recordInstance = evaluateExpression(
        expression.recordLiteral,
        context,
        system
      );

      const instance = new NamedRecordInstance(
        expression,
        namedRecordKlass,
        recordInstance
      );

      return instance;
    }

    case "NumberLiteral": {
      return number(expression.value, expression);
    }

    case "StringLiteral": {
      return string(expression.value);
    }

    case "BooleanLiteral": {
      return boolean(expression.value);
    }

    case "MapLiteral": {
      throw new Error("Not implemented, MapLiteral");
    }

    case "ListLiteral": {
      const values = expression.expressions.map((expr) =>
        evaluateExpression(expr, context, system)
      );
      return list(values);
    }

    case "RecordLiteral": {
      const props = new Map<string, Value>();
      for (const def of expression.definitions) {
        const childExpression = def.expression;
        const value = evaluateExpression(childExpression, context, system);
        // TODO: ensure no duplicate identifiers
        props.set(def.identifier.value, value);
      }

      const instance = record(expression, props);
      return instance;
    }

    case "FunctionCall": {
      const { identifier, argument } = expression;

      // built-in for now, str function converts a value to string
      if (identifier.value === "str") {
        const argumentValue = evaluateExpression(argument, context, system);
        const v = argumentValue.props.get("v");
        if (!v) {
          throw new Error("error with built-in str");
        }
        return string(stringOfValue(v));
      }

      // built-in for now, js function evaluates javascript
      if (identifier.value === "js") {
        const argumentValue = evaluateExpression(argument, context, system);
        const v = argumentValue.props.get("v");
        if (!v) {
          throw new Error("error with built-in js");
        }
        const result = valueOfJavascriptValue(eval(expectString(v).value));
        return result;
      }

      const funcInstance = context.valueScope.get(
        identifier.value,
        `No definition for function ${identifier.value}`
      );

      if (funcInstance instanceof ScopeError) {
        throw funcInstance;
      }

      // TODO: other function types
      const instKind = funcInstance.kind;
      if (
        instKind !== "MatchFunctionInstance" &&
        instKind !== "AnonymousFunctionInstance"
      ) {
        throw new Error(
          `${identifier.value} is a ${funcInstance.kind}, not a function`
        );
      }
      const argumentValue = evaluateExpression(argument, context, system);

      return callFunction(funcInstance, argumentValue, context, system);
    }

    case "MatchExpression": {
      const value = evaluateExpression(expression.expression, context, system);
      const result = evaluateMatch(value, expression.block, context, system);
      return result;
    }

    case "AnonymousFunctionLiteral": {
      const func = new AnonymousFunctionInstance(expression);
      return func;
    }

    // Operations
    case "PrefixUnaryOperation": {
      return evaluatePrefixUnaryExpression(expression, context, system);
    }

    case "SuffixUnaryOperation": {
      return evaluateSuffixUnaryExpression(expression, context, system);
    }

    case "BinaryOperation": {
      return evaluateBinaryExpression(expression, context, system);
    }

    default: {
      throw exhaustive(kind);
    }
  }
}

// The type of destructuring for function arguments, with types
// const foo = (a: number, b: string) => {}
function destructureWithRecordDefintion(
  recordDef: LangType["RecordDefinition"],
  value: Value,
  context: Context
) {
  switch (value.kind) {
    case "RecordInstance":
    case "NamedRecordInstance":
      break;
    default:
      // TODO: not exhaustive
      throw new Error(
        "Can't destrucutre, not RecordInstance or NamedRecordInstance"
      );
  }

  const props =
    value.kind === "RecordInstance" ? value.props : value.recordLiteral.props;

  for (const def of recordDef.definitions) {
    const val = props.get(def.identifier.value);

    if (val == null) {
      throw new Error(
        `Prop ${def.identifier.value} doesn't exist in value to deconstruct`
      );
    }

    context.valueScope.define(def.identifier.value, val);
    // TODO: anything else?
  }
}

// // The type of destructuring for assignments, without types
// // const (a: foo, b) = thing;
// function destructureWithRecordLiteral() {
//   // empty
// }

function callFunction(
  func: MatchFunctionInstance | AnonymousFunctionInstance,
  argument: Value,
  context: Context,
  system: System
): Value {
  switch (func.kind) {
    case "AnonymousFunctionInstance": {
      context.stack.push(func);
      console.log("called");

      const returned = evaluateWithScope(context, () => {
        destructureWithRecordDefintion(func.src.argument, argument, context);
        evaluateStatements(func.src.block.statements, context, system);
      });

      context.stack.pop();

      if (returned == null) {
        // TODO: do I really want functions to return an implicit null?
        return nil(returned);
      } else {
        return returned;
      }
    }

    case "MatchFunctionInstance": {
      // TODO: test types
      // TODO: ensure pattern is exhaustive, so we don't have to worry about that here
      // TODO: just executing first case for now

      for (const caseEntry of func.src.block.caseEntries) {
        // caseEntry.guard
        context.valueScope.push();
        context.stack.push(func);

        let result = null;
        try {
          evaluateStatements(caseEntry.block.statements, context, system);
        } catch (interrupt) {
          if (interrupt instanceof ReturnInterrupt) {
            result = interrupt.value;
          } else {
            throw interrupt;
          }
        }

        context.stack.pop();
        context.valueScope.pop();
        return nullthrows(result, "fixme, case block returns nothing");
      }

      throw new Error("fixme, no case blocks");
    }

    default: {
      throw exhaustive(func);
    }
  }
}
