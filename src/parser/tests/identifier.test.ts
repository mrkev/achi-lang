import { Lang } from "../parser";

test("Identifier", () => {
  const result = Lang.ValueIdentifier.tryParse("fooBar");
  expect(result).toMatchSnapshot();
});

test("ValueIdentifier.succuesses", () => {
  expect(() => Lang.ValueIdentifier.tryParse("fooBar")).not.toThrow();
  expect(() => Lang.ValueIdentifier.tryParse("f")).not.toThrow();
  expect(() => Lang.ValueIdentifier.tryParse("a")).not.toThrow();
});

test("ValueIdentifier.failures", () => {
  expect(() => Lang.ValueIdentifier.tryParse("3fooBar")).toThrow();
  expect(() => Lang.ValueIdentifier.tryParse("foo3Bar")).toThrow();
  expect(() => Lang.ValueIdentifier.tryParse("FooBar3")).toThrow();
  expect(() => Lang.ValueIdentifier.tryParse("7283493")).toThrow();
});
