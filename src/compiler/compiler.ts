import { LangType } from "../parser/parser";
import * as ts from "typescript";

export function generateEmptyExports() {
  return ts.factory.createExportDeclaration(
    undefined,
    undefined,
    false,
    ts.factory.createNamedExports([]),
    undefined,
    undefined
  );
}

export function compileProgram(ast: LangType["Program"]) {
  const resultStatements = [];
  for (const statement of ast.statements) {
    if (statement.kind === "NamedRecordDefinitionStatement") {
      const tsStatement = compileStatement(statement);
      resultStatements.push(tsStatement);
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
    // TODO: add constructor to initialize props
    // class Point(x: number, y: number) => class Point { x: number; y: number}
    case "NamedRecordDefinitionStatement": {
      const {
        identifier,
        record: { definitions },
      } = statement.namedRecordDefinition;

      const classMembers = [];
      const constructorParams = [];
      const constructorStatements = [];
      for (const defn of definitions) {
        const propName = defn.identifier.value;
        const propType = defn.typeTag.identifier.value;

        const typeRef = ts.factory.createTypeReferenceNode(propType);

        // class { <<x: number;>> }
        classMembers.push(
          ts.factory.createPropertyDeclaration(
            [],
            [],
            defn.identifier.value,
            undefined,
            typeRef,
            undefined
          )
        );

        // constructor( <<x: number,>> )
        constructorParams.push(
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            propName,
            undefined,
            typeRef,
            undefined
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
              ts.factory.createIdentifier(propName)
            )
          )
        );
      }

      const constructorDeclaration = ts.factory.createConstructorDeclaration(
        undefined,
        undefined,
        constructorParams,
        ts.factory.createBlock(constructorStatements, true)
      );
      classMembers.push(constructorDeclaration);

      const classDeclaration = ts.factory.createClassDeclaration(
        undefined,
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
