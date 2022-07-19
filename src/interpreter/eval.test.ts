import { Lang } from "../parser/parser";
import { Context } from "./Context";
import { evaluateExpression } from "./evaluateExpression";
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

test("func.1", () => {
  const logs = logsFor(`
  function foo matches Card {
    case King(): { }
  };
  #log foo;
  `);
  expect(logs).toMatchSnapshot();
});

test("evaluateExpression.NamedRecordLiteral", () => {
  // const context = Context.create();
  // context.values().set("Point");
  // evaluateExpression();
});
