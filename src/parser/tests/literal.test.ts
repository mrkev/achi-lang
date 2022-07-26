import { Lang } from "../parser";

test("BooleanLiteral.true", () => {
  const result = Lang.BooleanLiteral.tryParse("true");
  expect(result).toMatchSnapshot();
});

test("BooleanLiteral.false", () => {
  const result = Lang.BooleanLiteral.tryParse("false");
  expect(result).toMatchSnapshot();
});
