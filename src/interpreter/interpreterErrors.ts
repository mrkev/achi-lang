import { Meta } from "../parser/Node";
import { LangType } from "../parser/parser";

export class ScriptError extends Error {
  readonly pos: Meta;
  constructor(message: string, pos: Meta, options?: ErrorOptions) {
    super(message, options);
    this.pos = pos;
  }
}

export class ScopeError extends Error {
  readonly identifier: LangType["ValueIdentifier"];
  constructor(identifier: LangType["ValueIdentifier"], options?: ErrorOptions) {
    const start = identifier["@"].start;
    super(
      `Identifier "${identifier.value}" not found (at ${start.line}:${start.column})`,
      options
    );
    this.identifier = identifier;
  }

  location(): Readonly<Meta> {
    return this.identifier["@"];
  }
}

export class InterpreterError extends Error {}
