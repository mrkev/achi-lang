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

test("UnaryOperation", () => {
  expect(Lang.OperationExpression.tryParse("1!!!")).toMatchSnapshot();
  expect(Lang.OperationExpression.tryParse("-1")).toMatchSnapshot();
});

test("BinaryOperation", () => {
  expect(Lang.OperationExpression.tryParse("1^2^3")).toMatchSnapshot();
  // TODO: bug. This is the same as the next one and it shouldn't
  // already there in: https://github.com/jneen/parsimmon/blob/2cbcd06ed9805132c10c30f26fc0788e26533183/examples/math.js
  expect(Lang.OperationExpression.tryParse("-(3 + 3)^3^2!")).toMatchSnapshot();
  expect(
    Lang.OperationExpression.tryParse("(-(3 + 3))^3^2!")
  ).toMatchSnapshot();
  expect(Lang.OperationExpression.tryParse("(5 + 5) + 3")).toMatchSnapshot();
  // expect(Lang.MyMath.tryParse("hello + 3")).toMatchSnapshot();
});

test("BinaryOperation.identifier", () => {
  expect(Lang.OperationExpression.tryParse("hello + 3")).toMatchSnapshot();
});

test("BinaryOperation.null", () => {
  expect(Lang.OperationExpression.tryParse("null != 3")).toMatchSnapshot();
});
