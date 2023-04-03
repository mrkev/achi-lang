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
const litTrue = true;
const litFive = 5;
`;

test("match.1", () => {
  const logs = logsFor(`
  ${COMMON_DEFS}
  const result = match (four) {
    case Card.King(): {
      #log "king"
    };
    case Card.Number(value: value): {
      #log "number card"
    }
  };
  `);
  expect(logs).toEqual(["number card"]);
});

test("match.2", () => {
  const logs = logsFor(`
  ${COMMON_DEFS}
  const result = match (king) {
    case Card.King(): {
      #log "king"
    };
    case Card.Number(value: value): {
      #log "number card"
    }
  };
  `);
  expect(logs).toEqual(["king"]);
});

test("match.binding", () => {
  const logs = logsFor(`
  ${COMMON_DEFS}
  const result = match (four) {
    case Card.King(): {
      #log "king"
    };
    case Card.Number(value: value): {
      #log value
    }
  };
  `);
  expect(logs).toEqual(["4"]);
});

test("match.literals", () => {
  const logs = logsFor(`
  ${COMMON_DEFS}
  const result = match (litTrue) {
    case false: {
      #log "false"
    };
    case true: {
      #log "true"
    };
  };
  `);
  expect(logs).toEqual(["true"]);
});

// test("match.error", () => {
//   expect(
//     logsFor(`
//   ${COMMON_DEFS}
//   const result = match (nonexistant) {
//     case 3: {
//       return "hello"
//     };
//   };
//   #log result
//   `)
//   ).toThrow();
// });
