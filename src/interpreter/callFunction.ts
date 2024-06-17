import { Context } from "./Context";
import {
  ReturnInterrupt,
  evaluateStatements,
  evaluateWithScope,
} from "./evaluateStatements";
import { exhaustive, nullthrows } from "../nullthrows";
import { System } from "./runtime/System";
import { ValueType, nil } from "./runtime/value";
import { destructureWithRecordDefintion } from "./evaluateExpression";
import { dynamicTypecheck } from "./dynamicTypechecker";

// // The type of destructuring for assignments, without types
// // const (a: foo, b) = thing;
// function destructureWithRecordLiteral() {
//   // empty
// }
export function callFunction(
  func:
    | ValueType["MatchFunctionInstance"]
    | ValueType["AnonymousFunctionInstance"],
  argument: ValueType["Value"],
  context: Context,
  system: System
): ValueType["Value"] {
  switch (func.kind) {
    case "AnonymousFunctionInstance": {
      context.stack.push(func);
      // console.log("called");

      // TODO: check if incoming record conforms to argument.
      dynamicTypecheck(argument, func.ast.argument);

      // If not, error will show in `destructureWithRecordDefintion` as the
      // destructuring failing, which is confusing
      const returned = evaluateWithScope(context, () => {
        destructureWithRecordDefintion(func.ast.argument, argument, context);
        evaluateStatements(func.ast.block.statements, context, system);
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
      for (const caseEntry of func.ast.block.caseEntries) {
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
