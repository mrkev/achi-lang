import * as Parsimmon from "parsimmon";

/*

type Point (
  x: number,
  y: number,
)

const a = {} => {

}


*/

enum NodeKind {
  Definition = "Definition",
  RecordDefinition = "RecordDefinition",
  NamedTupleDefinition = "NamedTupleDefinition",
  TupleDefinition = "TupleDefinition",
  NamedRecordDefinition = "NamedRecordDefinition",
}

export const Lang = Parsimmon.createLanguage({
  _: () => {
    return Parsimmon.optWhitespace;
  },
  __: () => {
    return Parsimmon.whitespace;
  },
  _comma: (r) => {
    return Parsimmon.string(",").trim(r._);
  },
  Value: (r) => {
    return Parsimmon.alt(r.Number, r.Identifier, r.List);
  },
  Number: () => {
    return Parsimmon.regexp(/[0-9]+/).map(Number);
  },
  Identifier: () => {
    return Parsimmon.regexp(/[a-zA-Z]+/);
  },
  List: (r) => {
    return Parsimmon.string("[")
      .then(r.Value.sepBy(r._))
      .skip(Parsimmon.string("]"));
  },

  // type Point(number, number)
  NamedTupleDefinition: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("type"),
      r._,
      r.Identifier,
      r._,
      r.TupleDefinition,
      function (_0, _1, identifier, _2, tuple) {
        return {
          kind: NodeKind.NamedTupleDefinition,
          identifier,
          tuple,
        };
      }
    );
  },

  //* (number, number)
  TupleDefinition: (r) => {
    return Parsimmon.string("(")
      .then(Parsimmon.sepBy1(r.Identifier, r._comma))
      .skip(Parsimmon.string(")"))
      .map((definitions) => {
        return {
          kind: NodeKind.TupleDefinition,
          definitions,
        };
      });
  },

  //* type Point(x: number, y: number)
  NamedRecordDefinition: (r) => {
    return Parsimmon.seqMap(
      Parsimmon.string("type"),
      r._,
      r.Identifier,
      r._,
      r.RecordDefinition,
      function (_0, _1, identifier, _2, record) {
        return {
          kind: NodeKind.NamedRecordDefinition,
          identifier,
          record,
        };
      }
    );
  },

  //* (x: number, y: number)
  RecordDefinition: (r) => {
    return Parsimmon.string("(")
      .then(Parsimmon.sepBy1(r.Definition, r._comma))
      .skip(Parsimmon.string(")"))
      .map((definitions) => {
        return {
          kind: NodeKind.RecordDefinition,
          definitions,
        };
      });
  },

  // x: number
  Definition: (r) => {
    return Parsimmon.seqMap(
      r.Identifier,
      r._,
      Parsimmon.string(":"),
      r._,
      r.Identifier,
      (identifier, _1, _2, _3, type) => {
        return {
          kind: NodeKind.Definition,
          identifier,
          type,
        };
      }
    );
  },
});

const program = `
type Point (
  x: number,
  y: number,
)

const x = Point(x: 1, y: 2)

function add (a: Point, b: Point) {
  
}

const serialize(this: Point) {
  
}

x.serialize()

`;

// console.log(Lang.NamedTupleDefinition.tryParse("type Point(number, number)"));
