import { interpret } from "./interpreter";
import { System } from "./System";

function logsFor(script: string) {
  const system = new System();
  interpret(script, system);
  return system.console._log;
}

test("simple.1", () => {
  const logs = logsFor(`#log "hi"`);
  expect(logs).toMatchSnapshot();
});

test("if.1", () => {
  const logs = logsFor(`
  if (1) {
    #log "pass"
  }
  `);
  expect(logs).toMatchSnapshot();
});

test("class.1", () => {
  const logs = logsFor(`
  class Point(x: number, y: number)
  `);
  expect(logs).toMatchSnapshot();
});
