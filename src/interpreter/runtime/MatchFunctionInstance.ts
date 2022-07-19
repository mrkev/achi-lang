import { LangType } from "../../parser/parser";
import { Value } from "../interpreter";

export class MatchFunctionInstance {
  ast: LangType["MatchFunction"];
  get identifier(): string {
    return this.ast.identifier.value;
  }

  constructor(ast: LangType["MatchFunction"]) {
    this.ast = ast;
  }
}
