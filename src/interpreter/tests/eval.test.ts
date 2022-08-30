import { logsFor } from "./logsFor";

test("simple.1", () => {
  const logs = logsFor(`#log "hi"`);
  expect(logs).toMatchSnapshot();
});

test("if.true", () => {
  const logs = logsFor(`
  if (1) {
    #log "pass"
  }
  `);
  expect(logs).toMatchSnapshot();
});

test("if.true", () => {
  const logs = logsFor(`
  if (1) {
    #log "pass"
  }
  `);
  expect(logs).toMatchSnapshot();
});

test("error.nice", () => {
  const logs = logsFor(`

  const one = y;
  #log one
  `);
  expect(logs).toMatchSnapshot();
});

// test("if.false", () => {
//   const logs = logsFor(`
//   if (0) {
//     #log "pass"
//   }
//   `);
//   expect(logs).toEqual([]);
// });

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

test("func.2", () => {
  const logs = logsFor(`
  const foo = (x: number) => { return "hello" };
  #log foo()`);
  expect(logs).toEqual(["hello"]);
});

// test("evaluateExpression.NamedRecordLiteral", () => {
//   // const context = Context.create();
//   // context.values().set("Point");
//   // evaluateExpression();
// });
