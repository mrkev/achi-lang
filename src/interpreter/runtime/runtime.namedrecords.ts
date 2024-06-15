import type { LangType } from "../../parser/parser";
import { RecordInstance, ValueI } from "./value";

type ValueType = string; //TODO

/**
 * Represents the constructor for a named record, as it sits in memory
 * ready to be instantiated.
 */
export class NamedRecordKlass implements ValueI {
  readonly kind = "NamedRecordKlass";

  readonly classname: string;
  readonly valueSpec: Map<string, ValueType> = new Map(); // identifer => type
  readonly src: LangType["NamedRecordDefinition"];
  constructor(
    ast: LangType["NamedRecordDefinition"],
    classname: string,
    valueSpec: Map<string, string>
  ) {
    this.src = ast;
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
export class NamedRecordInstance implements ValueI {
  readonly kind = "NamedRecordInstance";
  readonly konstructor: NamedRecordKlass;
  readonly recordLiteral: RecordInstance;
  readonly src: LangType["NamedRecordLiteral"];
  constructor(
    ast: LangType["NamedRecordLiteral"],
    konstructor: NamedRecordKlass,
    recordLiteralInstance: RecordInstance
  ) {
    this.src = ast;
    this.konstructor = konstructor;
    this.recordLiteral = recordLiteralInstance;
  }
}

// ie, classes Card { King(); Queen(); ...etc }
export class NamedRecordDefinitionGroupInstance implements ValueI {
  readonly kind = "NamedRecordDefinitionGroupInstance";
  readonly src: LangType["NamedRecordDefinitionGroup"];
  readonly klasses: Map<string, NamedRecordKlass>;
  constructor(
    ast: LangType["NamedRecordDefinitionGroup"],
    klasses: Map<string, NamedRecordKlass>
  ) {
    this.src = ast;
    this.klasses = klasses;
  }
}
