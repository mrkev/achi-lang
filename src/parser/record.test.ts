import { Lang } from "./parser";

test("NamedRecordDefinition", () => {
  const result = Lang.NamedRecordDefinition.tryParse(
    "class Point(x: number, y: number)"
  );
  expect(result).toMatchSnapshot();
});

test("NamedRecordLiteral", () => {
  const result = Lang.NamedRecordLiteral.tryParse("Point(x: 5, y: 3)");
  expect(result).toMatchSnapshot();
});

test("RecordLiteral", () => {
  const result = Lang.RecordLiteral.tryParse("(x: 5, y: 3)");
  expect(result).toMatchSnapshot();
});

// Literal building blocks

test("NamedLiteral", () => {
  const result = Lang.NamedLiteral.tryParse("x: 5");
  expect(result).toMatchSnapshot();
});

// Definition building blocks

test("RecordDefinition", () => {
  const result = Lang.RecordDefinition.tryParse("(x: number, y: number)");
  expect(result).toMatchSnapshot();
});

test("NamedDefinition", () => {
  const result = Lang.NamedDefinition.tryParse("x: number");
  expect(result).toMatchSnapshot();
});
