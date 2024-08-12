import { Lang } from "../parser";

test("TypeTag.1", () => {
  const result = Lang.TypeTag.tryParse(": number");
  expect(result).toMatchSnapshot();
});

test("TypeTag.2", () => {
  const result = Lang.TypeTag.tryParse(": (x: number, y: number)");
  expect(result).toMatchSnapshot();
});

test("TypeTag.optional", () => {
  const result = Lang.TypeTag.tryParse("?: (x: number, y?: number)");
  expect(result).toMatchSnapshot();
});

test("TypeExpression.string", () => {
  const result = Lang.TypeExpression.tryParse('"foo"');
  expect(result).toMatchSnapshot();
});

test("TypeExpression.boolean", () => {
  const result = Lang.TypeExpression.tryParse("true");
  expect(result).toMatchSnapshot();
});

test("TypeExpression.number", () => {
  const result = Lang.TypeExpression.tryParse("3");
  expect(result).toMatchSnapshot();
});

test("TypeExpression.identifier", () => {
  const result = Lang.TypeExpression.tryParse("number");
  expect(result).toMatchSnapshot();
});

test("TypeExpression.identifier2", () => {
  const result = Lang.TypeExpression.tryParse("Foo");
  expect(result).toMatchSnapshot();
});

test("TypeExpression.intersection", () => {
  const result = Lang.TypeExpression.tryParse("Foo & boolean");
  expect(result).toMatchSnapshot();
});

test("TypeExpression.union", () => {
  const result = Lang.TypeExpression.tryParse('"foo" | 3');
  expect(result).toMatchSnapshot();
});

test("TypeIdentifier", () => {
  const result = Lang.TypeIdentifier.tryParse("string");
  expect(result).toMatchSnapshot();
});
