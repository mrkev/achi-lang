import { Lang } from "../../parser/parser";
import { compileTypeExpression } from "../compileTypeExpression";
import { expectStatementCompilation } from "../expectCompilation";

test("compiler.NamedRecordDefinitionStatement.unionType", async () => {
  await expectStatementCompilation(
    `class Point(x: number, y: "foo" | "bar")`,
    `class Point {
    x: number;
    y: "foo" | "bar";
    constructor(props: {
        x: number;
        y: "foo" | "bar";
    }) {
        this.x = props.x;
        this.y = props.y;
    }
}
`
  );
});

test("compiler.TypeExpression.StringLiteral", async () => {
  const node = Lang.TypeExpression.tryParse('"foo"');
  expect(compileTypeExpression(node)).toMatchSnapshot();
});
