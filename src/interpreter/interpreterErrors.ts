import { Meta } from "../parser/Node";
import { LangType } from "../parser/parser";

export class ScriptError extends Error {
  readonly pos: Meta | null;
  constructor(message: string, pos?: Meta, options?: any) {
    super(message, options);
    this.pos = pos ?? null;
  }
}

export class ScopeError {
  readonly identifier: LangType["ValueIdentifier"];
  constructor(identifier: LangType["ValueIdentifier"]) {
    this.identifier = identifier;
  }

  print(): string {
    const {
      "@": { start },
    } = this.identifier;
    return `Identifier "${this.identifier.value}" not found (at ${start.line}:${start.column})`;
  }

  location(): Readonly<Meta> {
    return this.identifier["@"];
  }
}
