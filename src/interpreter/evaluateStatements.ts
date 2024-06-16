import { LangType } from "../parser/parser";
import { Context } from "./Context";
import { evaluateExpression } from "./evaluateExpression";
import { exhaustive } from "../nullthrows";
import { System } from "./runtime/System";
import {
  NamedRecordDefinitionGroupInstance,
  NamedRecordKlass,
} from "./runtime/runtime.namedrecords";
import { ValueType, matchFunctionInstance } from "./runtime/value";
import { expectBoolean } from "./runtime/value.validators";
import { stringOfValue } from "./stringOfValue";
import { stringOfType } from "./types";

export class ReturnInterrupt {
  readonly value: ValueType["Value"];
  constructor(value: ValueType["Value"]) {
    this.value = value;
  }
}

// - Pushes a scope
// - If a statement `returns`, returns that value
// - Always pops the scope before returning
export function evaluateWithScope(
  context: Context,
  evaluate: () => void
): ValueType["Value"] | null {
  context.valueScope.push();
  let result = null;
  try {
    evaluate();
  } catch (interrupt) {
    if (interrupt instanceof ReturnInterrupt) {
      result = interrupt.value;
    } else {
      throw interrupt;
    }
  }
  context.valueScope.pop();
  if (result == null) {
    return null;
  } else {
    return result;
  }
}

/**
 * Evaluates all statements sequentially, returning the
 * value of the first "ReturnStatement" found or void
 */
export function evaluateStatements(
  statements: LangType["Statement"][],
  context: Context,
  system: System
): null {
  for (const statement of statements) {
    const { kind } = statement;
    switch (kind) {
      // defines, "class Point(x: number, y: number)"
      case "NamedRecordDefinitionStatement": {
        const identifer = statement.namedRecordDefinition.identifier;
        if (
          context.types.has(statement.namedRecordDefinition.identifier.value)
        ) {
          console.warn(
            "Overriding definition for",
            statement.namedRecordDefinition.identifier.value
          );
        }
        const klass = NamedRecordKlass.fromNamedRecordDefinition(
          statement.namedRecordDefinition
        );
        // todo "define" not set (ie, error if already exists)
        context.types.set(
          statement.namedRecordDefinition.identifier.value,
          klass
        );
        context.valueScope.define(identifer.value, klass);
        break;
      }

      // defines, "classes Card { ... }"
      case "NamedRecordDefinitionGroup": {
        const identifer = statement.identifier;
        if (context.valueScope.has(statement.identifier.value)) {
          throw new Error(
            `NamedRecordDefinitionGroup: ${statement.identifier.value} is already defined`
          );
        }

        const klasses = new Map<string, NamedRecordKlass>();
        for (const namedRecordDefinition of statement.namedRecordDefinitions) {
          const klass = NamedRecordKlass.fromNamedRecordDefinition(
            namedRecordDefinition
          );
          klasses.set(namedRecordDefinition.identifier.value, klass);
        }

        const groupInstance = new NamedRecordDefinitionGroupInstance(
          statement,
          klasses
        );

        context.types.set(identifer.value, groupInstance);
        context.valueScope.define(identifer.value, groupInstance);

        break;
      }

      case "IfStatement": {
        const guardValue = evaluateExpression(statement.guard, context, system);
        const guardBool = expectBoolean(guardValue).value;
        if (guardBool) {
          evaluateStatements(statement.block.statements, context, system);
        } else if (statement.elseCase == null) {
          // noop
        } else if (statement.elseCase.kind === "Block") {
          evaluateStatements(statement.elseCase.statements, context, system);
        } else if (statement.elseCase.kind === "IfStatement") {
          evaluateStatements([statement.elseCase], context, system);
        } else {
          throw exhaustive(statement.elseCase, "unhanlded if case");
        }
        break;
      }

      case "ConstantDefinition": {
        if (context.valueScope.has(statement.identifier.value)) {
          console.warn("Overriding definition for", statement.identifier.value);
        }
        const result = evaluateExpression(
          statement.expression,
          context,
          system
        );
        context.valueScope.define(statement.identifier.value, result);
        break;
      }

      // evaluates
      case "DEBUG_Log": {
        const value = evaluateExpression(statement.expression, context, system);
        system.console.log(stringOfValue(value));
        break;
      }

      // evaluates
      case "DEBUG_LogType": {
        const str = stringOfType(statement.typeExpression);
        system.console.log(str);
        break;
      }

      case "ReturnStatement": {
        const value = evaluateExpression(statement.expression, context, system);
        // We don't evaluate further, and instead throw to exit all execution
        // up to the call boundary. See the try/catch on `callFunction`
        throw new ReturnInterrupt(value);
      }

      // evaluates
      case "FunctionCall": {
        const _result = evaluateExpression(statement, context, system);
        // when functions are called as statements, we ignore the result
        break;
      }

      // defines
      case "MatchFunction": {
        if (context.valueScope.has(statement.identifier.value)) {
          console.warn(
            "MatchFunction: Overriding definition for",
            statement.identifier.value
          );
        }

        const matchFuncInstance = matchFunctionInstance(statement);
        context.valueScope.define(
          statement.identifier.value,
          matchFuncInstance
        );
        break;
      }

      // evaluates
      case "MatchExpression": {
        // Ignore the result when evaluating as a statement
        const _result = evaluateExpression(statement, context, system);
        break;
      }

      default:
        exhaustive(kind);
    }
  }
  return null;
}
