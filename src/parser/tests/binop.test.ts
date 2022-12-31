import { Lang } from "../parser";

// test("BinaryOperator.ops", () => {
//   // Arithmetic
//   expect(() => Lang.BinaryOperator.tryParse("+")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse("-")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse("/")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse("*")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse("%")).not.toThrow();
//   // Comparison
//   expect(() => Lang.BinaryOperator.tryParse("==")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse("!=")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse("<<")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse(">>")).not.toThrow();
//   // Logic
//   expect(() => Lang.BinaryOperator.tryParse("||")).not.toThrow();
//   expect(() => Lang.BinaryOperator.tryParse("&&")).not.toThrow();
// });

test("BinaryOperation", () => {
  expect(Lang.OperatorExpression.tryParse("1!!!")).toMatchSnapshot();
  expect(Lang.OperatorExpression.tryParse("1^2^3")).toMatchSnapshot();
  // TODO: bug. This is the same as the next one and it shouldn't
  expect(Lang.OperatorExpression.tryParse("-(3 + 3)^3^2!")).toMatchSnapshot();
  expect(Lang.OperatorExpression.tryParse("(-(3 + 3))^3^2!")).toMatchSnapshot();
  // expect(Lang.MyMath.tryParse("hello + 3")).toMatchSnapshot();
  // expect(Lang.BinaryOperation.tryParse("(5 + 5) + 3")).toMatchSnapshot();
});
