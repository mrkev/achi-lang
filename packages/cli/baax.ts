#!/usr/bin/env ts-node

import { Command } from "commander";
import pkg from "../baax-lang/package.json";
import { tryCompile, tryRun } from "../baax-lang/src/index";
import fs from "fs/promises";
import path from "path";
import { watchFile } from "./baax-compile";

const program = new Command();

program.description("the Ba'ax programming language").version(pkg.version);

// program.argument("<file>").option("--help").option("-w, --watch <char>");

// todo bxi
program
  .command("run <source>")
  .alias("i")
  .description("Runs a .bx file in the Baax interpreter")
  .action(async (source: string) => {
    const file = await fs.readFile(source, "utf8");
    const result = tryRun(file);

    result.system.console._log
      .map((x) => (typeof x === "string" ? x : x.message))
      .forEach((x) => console.log(x));
  });

type BaaxCompileOptions = {
  optput: boolean | string;
  watch: boolean;
};

// todo: bxc
program
  .command("compile <source>")
  .alias("c")
  .description("Compiles a .bx file to TypeScript")
  .option(
    "-o, --output [file]",
    "output to a file, default is same filename as input",
    false
  )
  .option("-w, --watch", "watches for source changes")
  .action(async (srcPath, opts: BaaxCompileOptions) => {
    const source = path.resolve(srcPath);

    if (opts.watch) {
      watchFile(source, () => {
        compileSingleFile(source, opts);
      });
    } else {
      compileSingleFile(source, opts);
    }
  });

program.parse();

async function compileSingleFile(source: string, opts: BaaxCompileOptions) {
  const file = await fs.readFile(source, "utf8");
  const result = tryCompile(file);

  if (opts.optput === false) {
    process.stdout.write(result);
    return;
  }

  const outpath =
    typeof opts.optput === "string" ? opts.optput : source + ".ts";

  await fs.writeFile(outpath, result, { encoding: "utf8" });
}
