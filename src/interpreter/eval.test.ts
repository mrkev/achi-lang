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

test("match.1", () => {
  const logs = logsFor(`
  classes Card {
    King();
    Queen();
    Jack();
    Number(value: number)
  };
  
  const four = Card.Number(value: 4);
  
  const result = match (four) {
    case Card.King(): {
      return "king"
    };
    case Card.Number(value: value): {
      return "number card"
    }
  };
  
  #log result 
  `);
  expect(logs).toMatchSnapshot();
});

test("evaluateExpression.NamedRecordLiteral", () => {
  // const context = Context.create();
  // context.values().set("Point");
  // evaluateExpression();
});
