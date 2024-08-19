#!/usr/bin/env ts-node

import { Command } from "commander";
import pkg from "../baax-lang/package.json";
import { tryCompile, tryRun } from "../baax-lang/src/index";
import fs from "fs/promises";

const program = new Command();

program.description("the Ba'ax programming language").version(pkg.version);

// program.argument("<file>").option("--help").option("-w, --watch <char>");

program
  .command("run <source>")
  .description("Runs a .bx file in the Baax interpreter")
  .action(async (source: string) => {
    const file = await fs.readFile(source, "utf8");
    const result = tryRun(file);

    result.system.console._log
      .map((x) => (typeof x === "string" ? x : x.message))
      .forEach((x) => console.log(x));
  });

program
  .command("c <source>")
  .description("Compiles a .bx file to TypeScript")
  .action(async (source) => {
    const file = await fs.readFile(source, "utf8");
    const result = tryCompile(file);
    console.log(result);
  });

program.parse();

const options = program.opts<{ help?: true }>();

// console.log(options);
// console.log(program.args[0]);
