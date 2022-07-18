import { LangType } from "../parser/parser";
import { evaluateExpression } from "./evaluateExpression";
import { Context } from "./Context";
import { System } from "./System";
import { exhaustive } from "./nullthrows";
import { NamedRecordConstructor, stringOfValue } from "./interpreter";

export function evaluateStatements(
  statements: LangType["Statement"][],
  context: Context,
  system: System
) {
  console.log("statements", statements);
  for (const statement of statements) {
    const { kind } = statement;
    console.log("eval", kind);
    switch (kind) {
      case "NamedRecordDefinitionStatement": {
        if (
          context.types.has(statement.namedRecordDefinition.identifier.value)
        ) {
          console.warn(
            "Overriding definition for",
            statement.namedRecordDefinition.identifier.value
          );
        }
        const konstructor = NamedRecordConstructor.fromNamedRecordDefinition(
          statement.namedRecordDefinition
        );
        context.types.set(
          statement.namedRecordDefinition.identifier.value,
          konstructor
        );
        break;
      }

      case "NamedRecordDefinitionGroup": {
        console.log("TODO NamedRecordDefinitionGroup");
        break;
      }

      case "IfStatement": {
        const guardValue = evaluateExpression(statement.guard, context);
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
        const result = evaluateExpression(statement.expression, context);
        context.values().define(statement.identifier.value, result);
        break;
      }

      case "DEBUG_Log": {
        const value = evaluateExpression(statement.expression, context);
        console.log("#log", stringOfValue(value), value);
        console.log("LOGGED");
        system.console.log(stringOfValue(value));

        break;
      }

      case "ReturnStatement": {
        throw new Error("Not implemented: ReturnStatement");
      }

      case "FunctionCall": {
        throw new Error("Not implemented: FunctionCall");
      }

      case "MatchFunction": {
        throw new Error("Not implemented: MatchFunction");
      }

      default:
        exhaustive(kind);
    }
  }
}
