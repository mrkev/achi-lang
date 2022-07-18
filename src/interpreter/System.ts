/**
 * System handles I/O, other APIs
 */
export class System {
  readonly console: Console = new Console();
}

class Console {
  _log: (string | Error)[] = [];

  clear() {
    this._log = [];
  }

  log(...msgs: (string | Error)[]) {
    this._log.push(...msgs);
  }
}
