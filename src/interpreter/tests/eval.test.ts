import { outFor, fatalFor } from "./logsFor";

test("simple.1", () => {
  const logs = outFor(`#log "hi"`);
  expect(logs).toMatchSnapshot();
});

test("if.true", () => {
  const logs = outFor(`
  if (1 == 1) {
    #log "pass"
  }
  `);
  expect(logs).toMatchSnapshot();
});

test("error.nice", () => {
  const logs = outFor(`
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
  const logs = outFor(`
  class Point(x: number, y: number)
  `);
  expect(logs).toMatchSnapshot();
});

test("func.1", () => {
  const logs = outFor(`
  function foo matches Card {
    case King(): { }
  };
  #log foo;
  `);
  expect(logs).toMatchSnapshot();
});

test("func.2", () => {
  const logs = outFor(`
  const greet = (s: string) => { return "hello " + s };
  #log greet(s: "world")`);
  expect(logs).toEqual("hello world");
});

test("props.missing", () => {
  const logs = outFor(`class Point(x: number, y: number);
const a = Point(y: 3)`);
  expect(logs).toMatchSnapshot();
});

test("props.extra", () => {
  const logs = outFor(`class Point(x: number, y: number);
const a = Point(x: 2, y: 3, z: 4)`);
  expect(logs).toMatchSnapshot();
});

// test("evaluateExpression.NamedRecordLiteral", () => {
//   // const context = Context.create();
//   // context.values().set("Point");
//   // evaluateExpression();
// });
