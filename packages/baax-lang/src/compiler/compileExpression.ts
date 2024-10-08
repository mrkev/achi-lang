import { LangType } from "../parser/parser";
import * as ts from "typescript";
import { exhaustive } from "../nullthrows";

export const expr = {
  string: (str: LangType["StringLiteral"]) =>
    ts.factory.createStringLiteral(str.value, false),

  identifier: (
    id:
      | LangType["ValueIdentifier"]
      | LangType["TypeIdentifier"]
      | LangType["AnyIdentifier"]
  ) => ts.factory.createIdentifier(id.value),
};

export function compileExpression(
  expression: LangType["Expression"]
): ts.Expression {
  switch (expression.kind) {
    // true -> true
    case "BooleanLiteral": {
      return expression.value
        ? ts.factory.createTrue()
        : ts.factory.createFalse();
    }
    // 3 -> 3
    case "NumberLiteral": {
      return ts.factory.createNumericLiteral(expression.value, undefined);
    }

    // "hello" -> "hello"
    case "StringLiteral": {
      return ts.factory.createStringLiteral(expression.value, false);
    }

    // foo -> foo
    case "ValueIdentifier": {
      return ts.factory.createIdentifier(expression.value);
    }

    case "NullLiteral":
      throw new Error("NullLiteral: Unimplemented");

    // (x: 3) -> {x: 3}
    case "RecordLiteral": {
      const props = [];
      for (const def of expression.definitions) {
        const defExpr = compileExpression(def.expression);
        const prop = ts.factory.createPropertyAssignment(
          def.identifier.value,
          defExpr
        );
        props.push(prop);
      }

      return ts.factory.createObjectLiteralExpression(props, true);
    }

    // Foo() -> new Foo;
    // Point(x: 3, y: 2) -> new Point({x: 3, y: 2})
    case "NamedRecordLiteral": {
      if (expression.identifier.kind === "NestedTypeIdentifier") {
        throw new Error(
          "Cant compile NamedRecordLiteral with NestedTypeIdentifier"
        );
      }

      const valueArguments =
        expression.recordLiteral.definitions.length > 0
          ? [compileExpression(expression.recordLiteral)]
          : undefined;

      return ts.factory.createNewExpression(
        ts.factory.createIdentifier(expression.identifier.value),
        undefined,
        valueArguments
      );
    }

    // foo() -> foo()
    // foo(x: 3) -> foo({x: 3})
    case "FunctionCall": {
      const valueArguments =
        expression.argument.definitions.length > 0
          ? [compileExpression(expression.argument)]
          : undefined;
      return ts.factory.createCallExpression(
        ts.factory.createIdentifier(expression.identifier.value),
        undefined,
        valueArguments
      );
    }

    case "MatchExpression":
    case "ListLiteral":
    case "MapLiteral":
    case "SuffixUnaryOperation":
    case "PrefixUnaryOperation":
    case "BinaryOperation":
    // case "FunctionDefinition":
    case "AnonymousFunctionLiteral": {
      throw new Error("Not implemented");
    }

    default:
      throw exhaustive(expression, "complie expression: not implemented");
  }
}
