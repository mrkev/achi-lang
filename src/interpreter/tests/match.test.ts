import { logsFor } from "./logsFor";

const COMMON_DEFS = `
classes Card {
  King();
  Queen();
  Jack();
  Number(value: number)
};
const four = Card.Number(value: 4);
const king = Card.King();
`;

test("match.1", () => {
  const logs = logsFor(`
  ${COMMON_DEFS}
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
  expect(logs).toEqual(["number card"]);
});

test("match.2", () => {
  const logs = logsFor(`
  ${COMMON_DEFS}
  const result = match (king) {
    case Card.King(): {
      return "king"
    };
    case Card.Number(value: value): {
      return "number card"
    }
  };
  #log result 
  `);
  expect(logs).toEqual(["king"]);
});

test("match.binding", () => {
  const logs = logsFor(`
  ${COMMON_DEFS}
  const result = match (four) {
    case Card.King(): {
      return "king"
    };
    case Card.Number(value: value): {
      return value
    }
  };
  #log result 
  `);
  expect(logs).toEqual(["4"]);
});
