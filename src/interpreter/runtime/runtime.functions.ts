import { LangType } from "../../parser/parser";
import { ValueI } from "./value";

// ie, (x: 3) => { return 3 }
export class AnonymousFunctionInstance implements ValueI {
  readonly kind = "AnonymousFunctionInstance";
  readonly src: LangType["AnonymousFunctionLiteral"];
  constructor(ast: LangType["AnonymousFunctionLiteral"]) {
    this.src = ast;
  }
}

// ie, function print matches Card
export class MatchFunctionInstance implements ValueI {
  readonly kind = "MatchFunctionInstance";
  readonly src: LangType["MatchFunction"];
  get identifier(): string {
    return this.src.identifier.value;
  }

  constructor(ast: LangType["MatchFunction"]) {
    this.src = ast;
  }
}
