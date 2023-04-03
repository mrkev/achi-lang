import { Context } from "../Context";
import { interpret } from "../interpreter";
import { System } from "../runtime/System";

export function logsFor(script: string) {
  const system = new System();
  interpret(script, system, Context.create(), { quietConsoleError: true });
  return system.console._log;
}

export function fatalFor(script: string) {
  const system = new System();
  interpret(script, system, Context.create(), { quietConsoleError: true });
  return system.console._fatalError;
}
