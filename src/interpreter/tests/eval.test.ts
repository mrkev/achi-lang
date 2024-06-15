import { logsFor, fatalFor } from "./logsFor";

test("simple.1", () => {
  const logs = logsFor(`#log "hi"`);
  expect(logs).toMatchSnapshot();
});

test("if.true", () => {
  const logs = logsFor(`
  if (1 == 1) {
    #log "pass"
  }
  `);
  expect(logs).toMatchSnapshot();
});

test("error.nice", () => {
  const logs = fatalFor(`
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
  const greet = (s: string) => { return "hello " + s };
  #log greet(s: "world")`);
  expect(logs).toEqual(["hello world"]);
});

test("props", () => {
  const logs = logsFor(`class Point(x: number, y: number);
const a = Point(y: 3)`);
  // TODO: THIS SHOUDL THROW BUT IS EMPTY ARRAY
  expect(logs).toMatchSnapshot();
});

test("props", () => {
  const logs = logsFor(`class Point(x: number, y: number);
const a = Point(x: 2, y: 3, z: 4)`);
  // TODO: THIS SHOULD THROW BUT IS EMPTY ARRAY
  expect(logs).toMatchSnapshot();
});

// test("evaluateExpression.NamedRecordLiteral", () => {
//   // const context = Context.create();
//   // context.values().set("Point");
//   // evaluateExpression();
// });
