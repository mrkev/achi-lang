import { Lang } from "../parser";

test("ImportStatement.1", () => {
  const result = Lang.ImportStatement.tryParse('import Foo from "./bar"');
  expect(result).toMatchSnapshot();
});

test("ImportStatement.1", () => {
  const result = Lang.Program.tryParse('import Foo from "./bar"');
  expect(result).toMatchSnapshot();
});
