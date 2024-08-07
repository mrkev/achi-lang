import { LangType } from "../parser/parser";
import { Context } from "./Context";
import {
  evaluateBinaryExpression,
  evaluatePrefixUnaryExpression,
  evaluateSuffixUnaryExpression,
} from "./evaluateOperation";
import { ScopeError, ScriptError } from "./interpreterErrors";
import { exhaustive } from "../nullthrows";
import { System } from "./runtime/System";
import { evaluateMatch } from "./runtime/runtime.match";
import {
  NamedRecordKlass,
  checkRecordType,
} from "./runtime/runtime.namedrecords";
import {
  ValueType,
  anonymousFunctionInstance,
  boolean,
  nil,
  list,
  namedRecordInstance,
  number,
  record,
  string,
  valueOfJavascriptValue,
} from "./runtime/value";
import { expectString } from "./runtime/value.validators";
import { stringOfValue } from "./stringOfValue";
import { callFunction } from "./callFunction";

export function evaluateExpression(
  expression: LangType["RecordLiteral"],
  context: Context,
  system: System
): ValueType["RecordInstance"];
export function evaluateExpression(
  expression: LangType["Expression"],
  context: Context,
  system: System
): ValueType["Value"];
export function evaluateExpression(
  expression: LangType["Expression"],
  context: Context,
  system: System
): ValueType["Value"] {
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

      const recordInstance = evaluateExpression(
        expression.recordLiteral,
        context,
        system
      );

      checkRecordType(recordInstance, namedRecordKlass);

      const instance = namedRecordInstance(
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

    case "NullLiteral": {
      return nil();
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
      const props = new Map<string, ValueType["Value"]>();
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
        instKind !== "AnonymousFunctionInstance" &&
        instKind !== "NativeFunctionInstance"
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
      const func = anonymousFunctionInstance(expression);
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
export function destructureWithRecordDefintion(
  recordDef: LangType["RecordDefinition"],
  value: ValueType["Value"],
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
      throw new ScriptError(
        `Prop ${def.identifier.value} doesn't exist in value to deconstruct`,
        def.identifier["@"]
      );
    }

    context.valueScope.define(def.identifier.value, val);
    // TODO: anything else?
  }
}
