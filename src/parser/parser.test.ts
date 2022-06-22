import { Lang } from "./parser";

test("Program", () => {
  const result = Lang.Program.tryParse(`
  class Point(x: number, y: number);
  const one = 1;
  const point = Point(x: one, y: 2);

  #log point
`);
  expect(result).toMatchSnapshot();
});

test("ConstantAssignment", () => {
  const result = Lang.ConstantAssignment.tryParse("const x = 3");
  expect(result).toMatchSnapshot();
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
