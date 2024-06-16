import { Context } from "../Context";
import { interpret } from "../interpreter";
import { System } from "../runtime/System";

export function outFor(script: string) {
  const system = new System();
  interpret(script, system, Context.create(), { quietConsoleError: true });
  return system.console.output();
}

export function fatalFor(script: string) {
  const system = new System();
  interpret(script, system, Context.create(), { quietConsoleError: true });
  return system.console._fatalError;
}
