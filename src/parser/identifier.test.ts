import { Lang } from "./parser";

test("Identifier", () => {
  const result = Lang.Identifier.tryParse("fooBar");
  expect(result).toMatchSnapshot();
});

test("Identifier.succuesses", () => {
  expect(() => Lang.Identifier.tryParse("fooBar")).not.toThrow();
  expect(() => Lang.Identifier.tryParse("f")).not.toThrow();
  expect(() => Lang.Identifier.tryParse("A")).not.toThrow();
});

test("Identifier.failures", () => {
  expect(() => Lang.Identifier.tryParse("3fooBar")).toThrow();
  expect(() => Lang.Identifier.tryParse("foo3Bar")).toThrow();
  expect(() => Lang.Identifier.tryParse("fooBar3")).toThrow();
  expect(() => Lang.Identifier.tryParse("7283493")).toThrow();
});
