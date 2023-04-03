import { readdirSync, readFileSync } from "fs";
import * as path from "path";
import { Context } from "../interpreter/Context";
import { interpret } from "../interpreter/interpreter";
import { System } from "../interpreter/runtime/System";

function exec(script: string, ...extra: ("compile" | "typecheck")[]): string {
  const _features = new Set(extra);
  const system = new System();
  try {
    interpret(script, system, new Context(), { quietConsoleError: true });
  } catch (e) {
    if (e instanceof Error) {
      system.console.fail(e);
    } else if (typeof e === "string") {
      system.console.fail(new Error(e));
    } else {
      console.error(e);
    }
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
