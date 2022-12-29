import { readdirSync, readFileSync } from "fs";
import * as path from "path";
import { interpret } from "../interpreter/interpreter";
import { System } from "../interpreter/runtime/System";
import { tryParse } from "../parser/parser";

function exec(script: string, ...extra: ("compile" | "typecheck")[]): string {
  const features = new Set(extra);
  const system = new System();
  try {
    interpret(script, system);
  } catch (e) {
    if (e instanceof Error || typeof e === "string") {
      system.console.log(e);
    }
    console.error(e);
  }

  return system.console._log.join("\n");
}

describe("e2e", () => {
  const tests = readdirSync(__dirname).filter((file) => /\.xtest$/.test(file));

  for (const testfile of tests) {
    const contents = readFileSync(path.join(__dirname, testfile), "utf-8");
    const [script, expected] = contents.split(/^---+\n/m);
    const result = exec(script);
    test(testfile, () => {
      expect(result).toEqual(expected);
    });
  }
});
