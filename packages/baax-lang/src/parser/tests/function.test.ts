import { Lang } from "../parser";

// test("FunctionDefinition", () => {
//   const result = Lang.FunctionDefinition.tryParse(
//     `(msg: string) => { hello(msg: msg) }`
//   );
//   expect(result).toMatchSnapshot();
// });

test("FunctionCall", () => {
  const result = Lang.FunctionCall.tryParse(`log(msg: "hello")`);
  expect(result).toMatchSnapshot();
});

test("FunctionCall.emtpyArg", () => {
  const result = Lang.FunctionCall.tryParse(`log()`);
  expect(result).toMatchSnapshot();
});

test("AnonymousFunctionLiteral", () => {
  const result = Lang.AnonymousFunctionLiteral.tryParse(
    "(value: number) => { return value }"
  );
  expect(result).toMatchSnapshot();
});

test("AnonymousFunctionLiteral.emptyArg", () => {
  const result = Lang.AnonymousFunctionLiteral.tryParse("() => { return 3 }");
  expect(result).toMatchSnapshot();
});
