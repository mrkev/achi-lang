import {
  expectExpressionCompilation,
  expectStatementCompilation,
} from "../expectCompilation";

test("compiler.NamedRecordDefinitionStatement", async () => {
  await expectStatementCompilation(
    `class Point(x: number, y: number)`,
    `class Point {
    x: number;
    y: number;
    constructor(props: {
        x: number;
        y: number;
    }) {
        this.x = props.x;
        this.y = props.y;
    }
}
`
  );
});

test("compiler.ConstantDefinition", async () => {
  await expectStatementCompilation(
    `const foo = 5`,
    `const foo = 5;
`
  );
});

test("compiler.BooleanLiteral", async () => {
  await expectExpressionCompilation(
    `true`,
    `true;
`
  );
});

test("compiler.NumberLiteral", async () => {
  await expectExpressionCompilation(
    `3`,
    `3;
`
  );
});

test("compiler.ValueIdentifier", async () => {
  await expectExpressionCompilation(
    `foo`,
    `foo;
`
  );
});

test("compiler.FunctionCall", async () => {
  await expectExpressionCompilation(
    `foo()`,
    `foo();
`
  );
});

test("compiler.FunctionCall.arg", async () => {
  await expectExpressionCompilation(
    `foo(x: 3)`,
    `foo({
    x: 3
});
`
  );
});

test("compiler.NamedRecordLiteral", async () => {
  await expectExpressionCompilation(
    `Point()`,
    // todo, maybe expect new Point(), and figure out how to allways
    // be explicit about the "()" when constructing something?
    `new Point;
`
  );
});

test("compiler.NamedRecordLiteral", async () => {
  await expectExpressionCompilation(
    `Point(x: 3, y: 3)`,
    `new Point({
    x: 3,
    y: 3
});
`
  );
});
