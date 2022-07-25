import { LangType } from "../parser/parser";
import { evaluateExpression } from "./evaluateExpression";
import { Context } from "./Context";
import { System } from "./System";
import { exhaustive } from "./nullthrows";
import { stringOfValue, Value } from "./interpreter";
import {
  NamedRecordDefinitionGroupInstance,
  NamedRecordKlass,
} from "./runtime/runtime.records";
import { MatchFunctionInstance } from "./runtime/runtime.match";
import { stringOfType } from "./types";

/**
 * Evaluates all statements sequentially, returning the
 * value of the first "ReturnStatement" found or void
 */
export function evaluateStatements(
  statements: LangType["Statement"][],
  context: Context,
  system: System
): Value | null {
  for (const statement of statements) {
    const { kind } = statement;
    switch (kind) {
      // defines, "class Point(x: number, y: number)"
      case "NamedRecordDefinitionStatement": {
        const identifer = statement.namedRecordDefinition.identifier.value;
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
        context
          .values()
          .define(identifer, { kind: "NamedRecordKlass", value: klass });
        break;
      }

      // defines, "classes Card { ... }"
      case "NamedRecordDefinitionGroup": {
        const identiferValue = statement.identifier.value;
        if (context.values().has(statement.identifier.value)) {
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

        const group = new NamedRecordDefinitionGroupInstance(
          statement,
          klasses
        );

        context.types.set(identiferValue, group);
        context.values().define(identiferValue, {
          kind: "NamedRecordDefinitionGroupInstance",
          value: group,
        });

        break;
      }

      case "IfStatement": {
        const guardValue = evaluateExpression(statement.guard, context, system);
        // TODO: determine truthiness
        if (guardValue) {
          // TODO: scoping!
          evaluateStatements(statement.block.statements, context, system);
        }
        break;
      }

      case "ConstantAssignment": {
        if (context.values().has(statement.identifier.value)) {
          console.warn("Overriding definition for", statement.identifier.value);
        }
        const result = evaluateExpression(
          statement.expression,
          context,
          system
        );
        context.values().define(statement.identifier.value, result);
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
        // We don't evaluate further, and instead return immediately //
        return value;
      }

      // evaluates
      case "FunctionCall": {
        const _result = evaluateExpression(statement, context, system);
        // when functions are called as statements, we ignore the result
        break;
      }

      // defines
      case "MatchFunction": {
        if (context.values().has(statement.identifier.value)) {
          console.warn(
            "MatchFunction: Overriding definition for",
            statement.identifier.value
          );
        }

        const matchFuncInstance = new MatchFunctionInstance(statement);
        context.values().define(statement.identifier.value, {
          kind: "MatchFunctionInstance",
          value: matchFuncInstance,
        });
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
