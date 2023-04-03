import { Meta } from "../parser/Node";

export class ScriptError extends Error {
  readonly pos: Meta | null;
  constructor(message: string, pos?: Meta, options?: any) {
    super(message, options);
    this.pos = pos ?? null;
  }
}
