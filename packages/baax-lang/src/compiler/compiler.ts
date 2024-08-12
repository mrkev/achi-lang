import * as ts from "typescript";
import { LangType } from "../parser/parser";
import { compileStatement } from "./compileStatement";
import { exhaustive } from "../nullthrows";
import { expr } from "./compileExpression";

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
    switch (statement.kind) {
      case "ImportStatement":
        {
          const clause = ts.factory.createImportClause(
            false,
            expr.identifier(statement.identifier),
            undefined
          );

          const importStatement = ts.factory.createImportDeclaration(
            undefined,
            clause,
            expr.string(statement.src),
            undefined
          );
          resultStatements.push(importStatement);
        }
        break;
      case "NamedRecordDefinitionStatement":
      case "ConstantDefinition":
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

export function compileBlock(
  ast: LangType["Block"] | LangType["StatementList"]
) {
  switch (ast.kind) {
    case "Block":
    case "StatementList": {
      const statements = ast.statements.map((statement) => {
        return compileStatement(statement);
      });
      return ts.factory.createBlock(statements, true);
    }
    default:
      throw exhaustive(ast);
  }
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
