import { interpret } from "../interpreter";
import { System } from "../System";

export function logsFor(script: string) {
  const system = new System();
  interpret(script, system);
  return system.console._log;
}
