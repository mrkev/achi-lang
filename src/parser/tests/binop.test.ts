import { Lang } from "../parser";

test("BinaryOperator.ops", () => {
  // Arithmetic
  expect(() => Lang.BinaryOperator.tryParse("+")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse("-")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse("/")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse("*")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse("%")).not.toThrow();
  // Comparison
  expect(() => Lang.BinaryOperator.tryParse("==")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse("!=")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse("<<")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse(">>")).not.toThrow();
  // Logic
  expect(() => Lang.BinaryOperator.tryParse("||")).not.toThrow();
  expect(() => Lang.BinaryOperator.tryParse("&&")).not.toThrow();
});

test("BinaryOperation", () => {
  expect(Lang.BinaryOperation.tryParse("3 + 3")).toMatchSnapshot();
  expect(Lang.BinaryOperation.tryParse("hello + 3")).toMatchSnapshot();
  // expect(Lang.BinaryOperation.tryParse("(5 + 5) + 3")).toMatchSnapshot();
});
