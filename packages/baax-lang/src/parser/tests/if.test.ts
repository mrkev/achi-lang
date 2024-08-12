import { Lang } from "../parser";

test("IfStatement", () => {
  const result = Lang.IfStatement.tryParse(`if (3) { return "hello" }`);
  expect(result).toMatchSnapshot();
});

test("IfStatement.else", () => {
  const result = Lang.IfStatement.tryParse(`if (3) {
      return "hello"
    } else {
      return "world"
    }`);

  expect(result).toMatchSnapshot();
});

test("IfStatement.elseif", () => {
  const result = Lang.IfStatement.tryParse(`if (3) {
      return "three"
    } else if (2) {
      return "two"
    } else {
      return "one"
    }`);

  expect(result).toMatchSnapshot();
});
