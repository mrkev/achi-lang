import { ScriptError } from "../interpreterErrors";
import { string } from "./value";

/**
 * System handles I/O, other APIs
 */
export class System {
  readonly console: Console = new Console();
  readonly module = {
    read(name: string) {
      return string(name);
    },
  };
}

class Console {
  _log: (string | Error)[] = [];
  _fatalError: Error | ScriptError | null = null;

  clear() {
    this._log = [];
  }

  log(...msgs: string[]) {
    this._log.push(...msgs);
  }

  fail(err: Error) {
    this._fatalError = err;
    this._log.push(err);
  }

  output(): string {
    return this._log.join("\n");
  }
}
