import * as Parsimmon from "parsimmon";
import { LangType } from "./parser";
import { sublang } from "./sublang";
import { Node, withAt } from "./Node";

export type LangType_Function = {
  // printPoint(x: 3, y: 4)
  FunctionCall: Node<{
    kind: "FunctionCall";
    identifier: LangType["ValueIdentifier"];
    argument: LangType["RecordLiteral"];
  }>;

  // FunctionDefinition: {
  //   kind: "FunctionDefinition";
  //   argument: LangType["RecordDefinition"];
  //   body: LangType["Block"];
  // };

  // (x: number) => { ... }
  AnonymousFunctionLiteral: Node<{
    kind: "AnonymousFunctionLiteral";
    argument: LangType["RecordDefinition"];
    block: LangType["Block"];
  }>;
};

/**
 * Defines binary operations
 */
export const LangDef_Function = sublang<LangType, LangType_Function>({
  // log(msg: "hello")
  FunctionCall: (r) => {
    return withAt(
      Parsimmon.seqMap(
        r.ValueIdentifier,
        r.RecordLiteral,
        function (identifier, argument) {
          return {
            kind: "FunctionCall",
            identifier,
            argument,
          };
        }
      )
    );
  },

  // (foo: string) => {}
  AnonymousFunctionLiteral: (r) => {
    return withAt(
      Parsimmon.seqMap(
        r.RecordDefinition,
        r.__,
        Parsimmon.string("=>"),
        r.__,
        r.Block,
        (argument, _1, _2, _3, block) => {
          return {
            kind: "AnonymousFunctionLiteral",
            argument,
            block,
          };
        }
      )
    );
  },

  /* 
  TODO;
  const add = (x: number, y: number) => number {
  }

  function foo(x: number): number {
    return x + 3;
  }
   */
  // FunctionDefinition: (r) => {
  //   return Parsimmon.seqMap(
  //     r.RecordDefinition,
  //     r._,
  //     Parsimmon.string("=>"),
  //     // TODO: type tag?
  //     r._,
  //     r.Block,
  //     function (argument, _1, _2, _3, body) {
  //       return {
  //         kind: "FunctionDefinition",
  //         argument,
  //         body,
  //       };
  //     }
  //   );
  // },
});
