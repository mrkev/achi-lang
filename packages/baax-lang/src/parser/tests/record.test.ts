import { Lang } from "../parser";

test("NamedRecordDefinitionGroup", () => {
  const result = Lang.NamedRecordDefinitionGroup.tryParse(
    `classes Card {
      King();
      Queen();
      Jack();
      Number(value: number)
    }`
  );
  expect(result).toMatchSnapshot();
});

test("NamedRecordDefinitionStatement", () => {
  const result = Lang.NamedRecordDefinitionStatement.tryParse(
    "class Point(x: number, y: number)"
  );
  expect(result).toMatchSnapshot();
});

test("NamedRecordDefinitionStatement.empty", () => {
  expect(
    Lang.NamedRecordDefinitionStatement.tryParse("class True()")
  ).toMatchSnapshot();
});

test("NamedRecordDefinitionStatement.withMethods", () => {
  expect(
    Lang.NamedRecordDefinitionStatement.tryParse(
      "class Foo() with { set() {} }"
    )
  ).toMatchSnapshot();
});

test("NamedRecordDefinitionStatement.withMethods2", () => {
  expect(
    Lang.NamedRecordDefinitionStatement.tryParse(
      `class TimelinePoint(
        t: number,
        u: "seconds" | "puleses"
      ) with {
        set(t: number, u: TimeUnit) {};
        unit(): "seconds" | "puleses" {}
      }`
    )
  ).toMatchSnapshot();
});

test("NamedRecordLiteral", () => {
  const result = Lang.NamedRecordLiteral.tryParse("Point(x: 5, y: 3)");
  expect(result).toMatchSnapshot();
});

test("NestedTypeIdentifier", () => {
  const result = Lang.NestedTypeIdentifier.tryParse("Card.King");
  expect(result).toMatchSnapshot();
});

test("NamedRecordLiteral.nestedIdentifier", () => {
  const result = Lang.NamedRecordLiteral.tryParse("Card.King(x: 5, y: 3)");
  expect(result).toMatchSnapshot();
});

test("RecordLiteral", () => {
  const result = Lang.RecordLiteral.tryParse("(x: 5, y: 3)");
  expect(result).toMatchSnapshot();
});

test("RecordLiteral.long", () => {
  const result = Lang.RecordLiteral.tryParse(`(
    num: 3,
    rec: (
      num: 2,
      str: "this",
      bool: true,
      rec: (x: 3, y: 3)
    )
  )`);
  expect(result).toMatchSnapshot();
});

// Literal building blocks

test("NamedLiteral", () => {
  const result = Lang.NamedLiteral.tryParse("x: 5");
  expect(result).toMatchSnapshot();
});

// Definition building blocks

test("RecordDefinition", () => {
  const result = Lang.RecordDefinition.tryParse("(x: number, y: number)");
  expect(result).toMatchSnapshot();
});

test("NamedDefinition", () => {
  const result = Lang.NamedDefinition.tryParse("x: number");
  expect(result).toMatchSnapshot();
});
