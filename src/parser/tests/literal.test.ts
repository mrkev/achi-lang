import { Lang } from "../parser";

test("literals", () => {
  const result = Lang.Program.tryParse(`
      const a = null;
      const b = true;
      const c = false;
      const d = "string";
      const e = [3,false,"string"];
    `);
  expect(result).toMatchSnapshot();
});

test("BooleanLiteral.true", () => {
  const result = Lang.BooleanLiteral.tryParse("true");
  expect(result).toMatchSnapshot();
});

test("BooleanLiteral.false", () => {
  const result = Lang.BooleanLiteral.tryParse("false");
  expect(result).toMatchSnapshot();
});

test("NullLiteral", () => {
  const result = Lang.NullLiteral.tryParse("null");
  expect(result).toMatchSnapshot();
});

test("ListLiteral", () => {
  const result = Lang.ListLiteral.tryParse(`[3,false,"string"]`);
  expect(result).toMatchSnapshot();
});

test("ListLiteral.recursive", () => {
  const result = Lang.ListLiteral.tryParse(`[3,[false],"string"]`);
  expect(result).toMatchSnapshot();
});

test("MapLiteral", () => {
  const result = Lang.MapLiteral.tryParse(`{foo: 3, bar: false}`);
  expect(result).toMatchSnapshot();
});

test("MapLiteral.recursive", () => {
  const result = Lang.MapLiteral.tryParse(`{foo: 3, bar: {baz: 3}}`);
  expect(result).toMatchSnapshot();
});
