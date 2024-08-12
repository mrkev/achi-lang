import { nullthrows } from "../nullthrows";
import { Lang } from "../parser/parser";
import { compileExpression } from "./compileExpression";
import { generateEmptyExports, printTSStatements } from "./compiler";
import { compileStatement } from "./compileStatement";
import { typecheck } from "./typecheck";
import * as ts from "typescript";

export async function expectStatementCompilation(src: string, ts: string) {
  const parseResult = Lang.Statement.parse(src);

  if (!parseResult.status) {
    throw new Error("Invalid compiler, couldn't parse source");
  }

  const tsAst = nullthrows(compileStatement(parseResult.value));
  const printed = printTSStatements([tsAst]);

  // We compile what we expect
  expect(printed).toEqual(ts);

  // We have to add an empty export so it typechecks
  const tsForTypechecking = [tsAst, generateEmptyExports()];

  const diagnostics = await typecheck(tsForTypechecking);
  // It has no type errors
  expect(diagnostics).toEqual([]);
  return;
}

export async function expectExpressionCompilation(
  src: string,
  tssrc: string,
  options?: { doTypecheck: boolean }
) {
  const parseResult = Lang.Expression.parse(src);

  if (!parseResult.status) {
    throw new Error("Invalid compiler, couldn't parse source");
  }

  const outTSExp = nullthrows(compileExpression(parseResult.value));
  const outTSStat = ts.factory.createExpressionStatement(outTSExp);

  const printed = printTSStatements([outTSStat]);

  // We compile what we expect
  expect(printed).toEqual(tssrc);

  // TODO: it's not typechecking?
  if (options?.doTypecheck) {
    // We have to add an empty export so it typechecks
    const tsForTypechecking = [outTSStat, generateEmptyExports()];

    const diagnostics = await typecheck(tsForTypechecking);
    // It has no type errors
    expect(diagnostics).toEqual([]);
  }
}
