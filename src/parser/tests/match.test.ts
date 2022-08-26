import { Lang } from "../parser";

test("NamedRecordDefinition", () => {
  const result = Lang.CaseEntry.tryParse("case (card: King(value: value)): {}");
  expect(result).toMatchSnapshot();
});

test("MatchFunction", () => {
  const result = Lang.MatchFunction.tryParse(
    "function printCard matches (card: Card) {}"
  );
  expect(result).toMatchSnapshot();
});

test("MatchFunction.cases", () => {
  const result = Lang.MatchFunction.tryParse(
    "function printCard matches (card: Card) { case King(): {} }"
  );
  expect(result).toMatchSnapshot();
});

test("MatchFunction.fullExample", () => {
  const result = Lang.MatchFunction.tryParse(
    `function printCard matches (card: Card) {
        case King(): {
          return "King"
        };

        case Queen(): {
          return "Queen"
        };

        case Jack(): {
          return "Jack"
        };

        case Number(value: value): {
          return "Number card"
        };
    }`
  );
  expect(result).toMatchSnapshot();
});

test("MatchExpression", () => {
  const result = Lang.MatchExpression.tryParse(
    "match (card) { case King(): {} }"
  );
  expect(result).toMatchSnapshot();
});

test("MatchFunction.fullExample", () => {
  const result = Lang.MatchExpression.tryParse(
    `match (card) {
        case King(): {
          return "King"
        };

        case Queen(): {
          return "Queen"
        };

        case Jack(): {
          return "Jack"
        };

        case Number(value: value): {
          return "Number card"
        };
    }`
  );
  expect(result).toMatchSnapshot();
});

// test("MatchFunction.recursive", () => {
//   const result = Lang.MatchExpression.tryParse(
//     `function fib matches (x: number) {
//       case (x: 0): {
//         return 3
//       }

//       case (x: 1): {
//         return 3
//       }

//       case (x: 0): {
//         return fib(x: x - 1) + fib(x: x - 2)
//       }
//     };

//     #log fib(x: 10)`
//   );
//   expect(result).toMatchSnapshot();
// });
