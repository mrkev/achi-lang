import { Lang } from "../parser";

test("BooleanLiteral.true", () => {
  const result = Lang.BooleanLiteral.tryParse("true");
  expect(result).toMatchSnapshot();
});

test("BooleanLiteral.false", () => {
  const result = Lang.BooleanLiteral.tryParse("false");
  expect(result).toMatchSnapshot();
});

test("ListLiteral", () => {
  const result = Lang.ListLiteral.tryParse(`[3,false,"string"]`);
  expect(result).toMatchSnapshot();
});

test("ListLiteral.recursive", () => {
  const result = Lang.ListLiteral.tryParse(`[3,[false],"string"]`);
  expect(result).toMatchSnapshot();
});

test("MapLiteral", () => {
  const result = Lang.MapLiteral.tryParse(`{foo: 3, bar: false}`);
  expect(result).toMatchSnapshot();
});

test("MapLiteral.recursive", () => {
  const result = Lang.MapLiteral.tryParse(`{foo: 3, bar: {baz: 3}}`);
  expect(result).toMatchSnapshot();
});
