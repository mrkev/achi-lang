import { LangType } from "../parser/parser";
import { evaluateExpression } from "./evaluateExpression";
import { Context } from "./Context";
import { System } from "./System";
import { exhaustive } from "./nullthrows";
import { stringOfValue, Value } from "./interpreter";
import { NamedRecordKlass } from "./runtime/NamedRecordConstructor";
import { MatchFunctionInstance } from "./runtime/MatchFunctionInstance";

/** Evaluates all statements sequentially, returning the value of the first "ReturnStatement" found or void */
export function evaluateStatements(
  statements: LangType["Statement"][],
  context: Context,
  system: System
): Value | null {
  for (const statement of statements) {
    const { kind } = statement;
    switch (kind) {
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

      case "NamedRecordDefinitionGroup": {
        console.log("TODO NamedRecordDefinitionGroup");
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

      case "DEBUG_Log": {
        const value = evaluateExpression(statement.expression, context, system);
        system.console.log(stringOfValue(value));
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

      default:
        exhaustive(kind);
    }
  }
  return null;
}
