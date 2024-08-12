import * as Parsimmon from "parsimmon";

export type Meta = Readonly<{
  start: Parsimmon.Index;
  end: Parsimmon.Index;
}>;

export type Node<
  T extends {
    [rest: string]: any;
    kind: string;
  }
> = Readonly<
  T & {
    "@": Meta;
  }
>;

export function withAt<
  T extends {
    [rest: string]: any;
    kind: string;
  }
>(parser: Parsimmon.Parser<T>): Parsimmon.Parser<Node<T>> {
  return Parsimmon.seqMap(
    Parsimmon.index,
    parser,
    Parsimmon.index,
    function (start, res, end) {
      return {
        ...res,
        "@": { start, end },
      };
    }
  );
}
