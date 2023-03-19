import { LangType } from "../parser/parser";
import * as ts from "typescript";
import { compileExpression } from "./compileExpression";

export function generateEmptyExports() {
  return ts.factory.createExportDeclaration(
    undefined,
    false,
    ts.factory.createNamedExports([]),
    undefined,
    undefined
  );
}

export function compileProgram(
  ast: LangType["Program"]
): ts.Statement[] | Error {
  const resultStatements = [];
  for (const statement of ast.statements) {
    if (
      statement.kind === "NamedRecordDefinitionStatement" ||
      statement.kind === "ConstantDefinition"
    ) {
      try {
        const tsStatement = compileStatement(statement);
        resultStatements.push(tsStatement);
      } catch (e) {
        if (e instanceof Error) {
          return e;
        } else {
          return new Error(String(e));
        }
      }
    }
  }

  // export {}
  resultStatements.push(generateEmptyExports());
  return resultStatements;
}

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
      const {
        identifier,
        record: { definitions },
      } = statement.namedRecordDefinition;

      const classMembers = [];
      const constructorTypeLiteralParams = [];
      const constructorStatements = [];
      for (const defn of definitions) {
        const propName = defn.identifier.value;
        const propType = defn.typeTag.identifier.value;

        const typeRef = ts.factory.createTypeReferenceNode(propType);

        // class { <<x: number;>> }
        classMembers.push(
          ts.factory.createPropertyDeclaration(
            [],
            defn.identifier.value,
            undefined,
            typeRef,
            undefined
          )
        );

        // constructor( <<x: number,>> )
        constructorTypeLiteralParams.push(
          ts.factory.createPropertySignature(
            undefined,
            propName,
            undefined,
            typeRef
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

      const constructorDeclaration = ts.factory.createConstructorDeclaration(
        undefined,
        [constructorParam],
        ts.factory.createBlock(constructorStatements, true)
      );
      classMembers.push(constructorDeclaration);

      const classDeclaration = ts.factory.createClassDeclaration(
        undefined,
        ts.factory.createIdentifier(identifier.value),
        undefined,
        undefined,
        classMembers
      );
      return classDeclaration;
    }
  }

  throw new Error("NOT IMPLEMENTED");
}

export function printTSStatements(tsStatements: ts.Statement[]): string {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const sourceFile = ts.factory.createSourceFile(
    tsStatements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );

  return printer.printFile(sourceFile);
}
