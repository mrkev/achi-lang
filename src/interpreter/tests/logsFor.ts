import { interpret } from "../interpreter";
import { System } from "../runtime/System";

export function logsFor(script: string) {
  const system = new System();
  interpret(script, system);
  return system.console._log;
}
