import { Lang } from "../parser";

test("TypeTag.1", () => {
  const result = Lang.TypeTag.tryParse(": number");
  expect(result).toMatchSnapshot();
});

test("TypeTag.2", () => {
  const result = Lang.TypeTag.tryParse(": (x: number, y: number)");
  expect(result).toMatchSnapshot();
});

// test("TypeExpression", () => {
//   const result = Lang.TypeTag.tryParse("Point(");
//   expect(result).toMatchSnapshot();
// });

test("TypeIdentifier", () => {
  const result = Lang.TypeIdentifier.tryParse("string");
  expect(result).toMatchSnapshot();
});
