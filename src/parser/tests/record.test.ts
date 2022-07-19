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

test("NamedRecordDefinition", () => {
  const result = Lang.NamedRecordDefinitionStatement.tryParse(
    "class Point(x: number, y: number)"
  );
  expect(result).toMatchSnapshot();
});

test("NamedRecordDefinition.empty", () => {
  expect(
    Lang.NamedRecordDefinitionStatement.tryParse("class True()")
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
