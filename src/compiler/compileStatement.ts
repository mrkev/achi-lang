import * as ts from "typescript";
import { LangType } from "../parser/parser";
import { compileExpression } from "./compileExpression";
import { compileTypeExpression } from "./compileTypeExpression";
import { exhaustive } from "../nullthrows";
import { compileBlock } from "./compiler";

export function compileStatement(
  statement: LangType["Statement"]
): ts.Statement {
  switch (statement.kind) {
    /**
     * const x = ...
     */
    case "ConstantDefinition": {
      const variableDecl = ts.factory.createVariableDeclaration(
        statement.identifier.value,
        undefined,
        undefined, // todo type
        compileExpression(statement.expression)
      );

      return ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [variableDecl],
          ts.NodeFlags.Const
        )
      );
    }

    // TODO: add constructor to initialize props
    // class Point(x: number, y: number) => class Point { x: number; y: number}
    case "NamedRecordDefinitionStatement": {
      return compileNamedRecordDefinitionStatement(statement);
    }
  }

  throw new Error("NOT IMPLEMENTED");
}

function compileNamedRecordDefinitionStatement(
  statement: LangType["NamedRecordDefinitionStatement"]
): ts.ClassDeclaration {
  const {
    identifier,
    record: { definitions },
  } = statement.namedRecordDefinition;

  const classMembers = [];
  const constructorTypeLiteralParams = [];
  const constructorStatements = [];

  for (const defn of definitions) {
    const propName = defn.identifier.value;
    const propType = compileTypeExpression(defn.typeTag.typeExpression);

    // class { <<x: number;>> }
    classMembers.push(
      ts.factory.createPropertyDeclaration(
        [],
        defn.identifier.value,
        undefined,
        propType,
        undefined
      )
    );

    // constructor( <<x: number,>> )
    constructorTypeLiteralParams.push(
      ts.factory.createPropertySignature(
        undefined,
        propName,
        undefined,
        propType
      )
    );

    // this.x = x
    constructorStatements.push(
      ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            propName
          ),
          ts.SyntaxKind.EqualsToken,
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("props"),
            ts.factory.createIdentifier(propName)
          )
        )
      )
    );
  }

  // props: {x: number}
  const constructorParam = ts.factory.createParameterDeclaration(
    undefined,
    undefined,
    "props",
    undefined,
    ts.factory.createTypeLiteralNode(constructorTypeLiteralParams),
    undefined
  );

  // constructor(...)
  const constructorDeclaration = ts.factory.createConstructorDeclaration(
    undefined,
    [constructorParam],
    ts.factory.createBlock(constructorStatements, true)
  );
  classMembers.push(constructorDeclaration);

  if (statement.methods != null) {
    for (const method of statement.methods.methods) {
      console.log(method);
      switch (method.kind) {
        case "MethodDefinition": {
          const name = ts.factory.createIdentifier(method.identifier.value);
          const block = compileBlock(method.block);

          const parameters = method.argument.definitions.map((defn) => {
            const name = ts.factory.createIdentifier(defn.identifier.value);
            const typeNode = compileTypeExpression(defn.typeTag.typeExpression);
            const questionToken = defn.typeTag.optional
              ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
              : undefined;
            return ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              name,
              questionToken,
              typeNode,
              undefined
            );
          });

          const methodDeclaration = ts.factory.createMethodDeclaration(
            undefined,
            undefined,
            name,
            undefined,
            undefined,
            parameters,
            undefined,
            block
          );
          classMembers.push(methodDeclaration);
          break;
        }
        default:
          throw exhaustive(method.kind);
      }
    }
  }

  const classDeclaration = ts.factory.createClassDeclaration(
    undefined,
    ts.factory.createIdentifier(identifier.value),
    undefined,
    undefined,
    classMembers
  );
  return classDeclaration;
}
