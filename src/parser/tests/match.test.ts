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
