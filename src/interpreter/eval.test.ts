import { tryParse } from "../parser/parser";
import { evaluate } from "./interpreter";
import { System } from "./System";

function doEvaluate(script: string) {
  const newlog: (Error | string)[] = [];
  const system = new System();

  try {
    const ast = tryParse(script);
    console.log(script);
    evaluate(ast, newlog, system);
  } catch (e) {
    system.console.log(e as Error);
    newlog.push(e as Error);
    console.error(e);
  }

  return { system };
}

test("example.1", () => {
  const finalSystem = doEvaluate(`#log "hi"`);
  expect(finalSystem.system.console._log[0]).toMatchSnapshot();
});
