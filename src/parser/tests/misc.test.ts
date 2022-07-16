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

test("IfStatement", () => {
  const result = Lang.IfStatement.tryParse(`if (3) { return "hello" }`);
  expect(result).toMatchSnapshot();
});

// TODO: is this what I want to do for booleans? would require
// lowercase named records, implicit unit for empty named record definitiosn
// or using the class itself for comparisons
test("boolean definition", () => {
  const result = Lang.Program.tryParse(`
  class true();
  class false();
  const one = true;

  #log one
`);
  expect(result).toMatchSnapshot();
});

test("ConstantAssignment", () => {
  const result = Lang.ConstantAssignment.tryParse("const x = 3");
  expect(result).toMatchSnapshot();
});

test("Block", () => {
  const result = Lang.Block.tryParse(`{ log(msg: "hello"); const x = 4; }`);
  expect(result).toMatchSnapshot();
});

test("FunctionDefinition", () => {
  const result = Lang.FunctionDefinition.tryParse(
    `(msg: string) => { hello(msg: msg) }`
  );
  expect(result).toMatchSnapshot();
});

test("FunctionCall", () => {
  const result = Lang.FunctionCall.tryParse(`log(msg: "hello")`);
  expect(result).toMatchSnapshot();
});

test("string", () => {
  expect(Lang.StringLiteral.tryParse(`"hello world"`)).toMatchSnapshot();
  expect(Lang.StringLiteral.tryParse(`"hello\\n world"`)).toMatchSnapshot();
});

// Types

test("NamedTupleDefinition", () => {
  const result = Lang.NamedTupleDefinition.tryParse(
    "type Point(number, number)"
  );
  expect(result).toMatchSnapshot();
});

test("TupleDefinition", () => {
  const result = Lang.TupleDefinition.tryParse("(number, number)");
  expect(result).toMatchSnapshot();
});

// -------------- Atoms
