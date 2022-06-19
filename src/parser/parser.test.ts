import { Lang } from "./parser";

// Types

test("NamedTupleDefinition", () => {
  const result = Lang.NamedTupleDefinition.tryParse(
    "type Point(number, number)"
  );
  expect(result).toMatchSnapshot();
});

test("NamedRecordDefinition", () => {
  const result = Lang.NamedRecordDefinition.tryParse(
    "type Point(x: number, y: number)"
  );
  expect(result).toMatchSnapshot();
});

test("TupleDefinition", () => {
  const result = Lang.TupleDefinition.tryParse("(number, number)");
  expect(result).toMatchSnapshot();
});

test("RecordDefinition", () => {
  const result = Lang.RecordDefinition.tryParse("(x: number, y: number)");
  expect(result).toMatchSnapshot();
});

// -------------- Atoms

test("Definition", () => {
  const result = Lang.Definition.tryParse("x: number");
  expect(result).toMatchSnapshot();
});

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
