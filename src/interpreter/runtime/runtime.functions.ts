import { LangType } from "../../parser/parser";

// ie, (x: 3) => { return 3 }
export class AnonymousFunctionInstance {
  ast: LangType["AnonymousFunctionLiteral"];
  constructor(ast: LangType["AnonymousFunctionLiteral"]) {
    this.ast = ast;
  }
}
