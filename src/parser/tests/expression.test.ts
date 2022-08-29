import { Lang } from "../parser";

test("ALON", () => {
  const result = Lang.Expression.tryParse(`(
    animals: {
      l1: (id: "l1", kind: "lion"),
      l2: (id: "l2", kind: "lion"),
      t1: (id: "t1", kind: "tiger"),
      t2: (id: "t2", kind: "tiger")
    },
    environments: [
      "jungle", "desert", "savannah"
    ]
  )`);
  expect(result).toMatchSnapshot();
});
