import type { LangType } from "../../parser/parser";
import { Context } from "../Context";
import { Value } from "../value";
import { System } from "./System";

/**
 * Represents the constructor for a named record, as it sits in memory
 * ready to be instantiated.
 */
export class NamedRecordKlass {
  readonly classname: string;
  readonly valueSpec: Map<string, string> = new Map(); // identifer => type
  ast: LangType["NamedRecordDefinition"];
  constructor(
    ast: LangType["NamedRecordDefinition"],
    classname: string,
    valueSpec: Map<string, string>
  ) {
    this.ast = ast;
    this.classname = classname;
    this.valueSpec = valueSpec;
  }

  static fromNamedRecordDefinition(
    def: LangType["NamedRecordDefinition"]
  ): NamedRecordKlass {
    const classname = def.identifier.value;
    const valueSpec = new Map<string, string>();
    for (const prop of def.record.definitions) {
      valueSpec.set(prop.identifier.value, prop.typeTag.identifier.value);
    }
    const res = new NamedRecordKlass(def, classname, valueSpec);
    // console.log(res.asClass());
    return res;
  }

  // TODO: this is an in-memory runtime object. Compilation should be done from
  // the AST (or some IR) so it can be done statically.
  asClass(): string {
    const props = [...this.valueSpec.keys()];
    return `
    class ${this.classname} {
      ${props.join(";")};
      constructor(${props.join(",")}) {
        ${props.map((prop) => {
          return `this.${prop}=${prop}`;
        })}
      }
    }
    `;
  }
}

// ie, Point(x: 3, y: 3)
export class NamedRecordInstance {
  readonly konstructor: NamedRecordKlass;
  readonly recordLiteral: RecordLiteralInstance;
  ast: LangType["NamedRecordLiteral"];
  constructor(
    ast: LangType["NamedRecordLiteral"],
    konstructor: NamedRecordKlass,
    recordLiteralInstance: RecordLiteralInstance
  ) {
    this.ast = ast;
    this.konstructor = konstructor;
    this.recordLiteral = recordLiteralInstance;
  }
}

// ie, (x: 3, y: 4)
export class RecordLiteralInstance {
  ast: LangType["RecordLiteral"];
  props: Map<string, Value>;
  constructor(ast: LangType["RecordLiteral"], props: Map<string, Value>) {
    this.ast = ast;
    this.props = props;
  }
}

// ie, classes Card { King(); Queen(); ...etc }
export class NamedRecordDefinitionGroupInstance {
  ast: LangType["NamedRecordDefinitionGroup"];
  klasses: Map<string, NamedRecordKlass>;
  constructor(
    ast: LangType["NamedRecordDefinitionGroup"],
    klasses: Map<string, NamedRecordKlass>
  ) {
    this.ast = ast;
    this.klasses = klasses;
  }
}
