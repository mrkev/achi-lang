import { nullthrows } from "../interpreter/nullthrows";
import { Lang } from "../parser/parser";
import {
  compileStatement,
  generateEmptyExports,
  printTSStatements,
} from "./compiler";
import { typecheck } from "./typecheck";

test("compiler.NamedRecordDefinitionStatement", async () => {
  const parseResult = Lang.NamedRecordDefinitionStatement.parse(
    `class Point(x: number, y: number)`
  );

  if (!parseResult.status) {
    throw new Error("Invalid compiler, couldn't parse source");
  }

  const tsAst = nullthrows(compileStatement(parseResult.value));
  const printed = printTSStatements([tsAst]);

  // We compile what we expect
  expect(printed).toEqual(
    `class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
`
  );

  // We have to add an empty export so it typechecks
  const tsForTypechecking = [tsAst, generateEmptyExports()];

  const diagnostics = await typecheck(tsForTypechecking);
  // It has no type errors
  expect(diagnostics).toEqual([]);
});
