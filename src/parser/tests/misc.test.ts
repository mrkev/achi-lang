import { Lang } from "../parser";

test("Program", () => {
  const result = Lang.Program.tryParse(`
  class Point(x: number, y: number);
  const one = 1;
  const point = Point(x: one, y: 2);

  #log point
`);
  expect(result).toMatchSnapshot();
});

test("Program.2", () => {
  const result = Lang.Program.tryParse(`
  class Point(x: number, y: number);
  const increment = (point: Point) => {
    const x = point;
    return Point(x: x, y: y)
  };
  const point = Point(x: one, y: 2);
  increment(point: point);

  #log point
`);
  expect(result).toMatchSnapshot();
});

test("ReturnStatement", () => {
  const result = Lang.ReturnStatement.tryParse(`return "string"`);
  expect(result).toMatchSnapshot();
});

test("Block.empty", () => {
  const result = Lang.Block.tryParse(`{}`);
  expect(result).toMatchSnapshot();
});

test("IfStatement", () => {
  const result = Lang.IfStatement.tryParse(`if (3) { return "hello" }`);
  expect(result).toMatchSnapshot();
});

test("NestedTypeIdentifier", () => {
  const result = Lang.NestedTypeIdentifier.tryParse("Card.King");
  expect(result).toMatchInlineSnapshot(`
{
  "kind": "NestedTypeIdentifier",
  "path": [
    {
      "kind": "TypeIdentifier",
      "value": "Card",
    },
    {
      "kind": "TypeIdentifier",
      "value": "King",
    },
  ],
}
`);
});

test("ConstantDefinition", () => {
  const result = Lang.ConstantDefinition.tryParse("const x = 3");
  expect(result).toMatchSnapshot();
});

test("ConstantDefinition.functionCall", () => {
  const result = Lang.ConstantDefinition.tryParse(
    "const x = foo(point: point)"
  );
  expect(result).toMatchSnapshot();
});

test("Block", () => {
  const result = Lang.Block.tryParse(`{ log(msg: "hello"); const x = 4; }`);
  expect(result).toMatchSnapshot();
});

test("string", () => {
  expect(Lang.StringLiteral.tryParse(`"hello world"`)).toMatchSnapshot();
  expect(Lang.StringLiteral.tryParse(`"hello\\n world"`)).toMatchSnapshot();
});

// Types

// test("NamedTupleDefinition", () => {
//   const result = Lang.NamedTupleDefinition.tryParse(
//     "type Point(number, number)"
//   );
//   expect(result).toMatchSnapshot();
// });

// test("TupleDefinition", () => {
//   const result = Lang.TupleDefinition.tryParse("(number, number)");
//   expect(result).toMatchSnapshot();
// });

// -------------- Atoms
