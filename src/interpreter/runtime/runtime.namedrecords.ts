import { exhaustive } from "../../nullthrows";
import type { LangType } from "../../parser/parser";
import { ValueI } from "./value";

type ValueID = string; //TODO

/**
 * Represents the constructor for a named record, as it sits in memory
 * ready to be instantiated.
 */
export class NamedRecordKlass implements ValueI {
  readonly kind = "NamedRecordKlass";

  readonly classname: string;
  readonly valueSpec: Map<string, ValueID> = new Map(); // identifer => type
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
      switch (prop.typeTag.typeExpression.kind) {
        case "NamedRecordDefinition":
        case "RecordDefinition":
          // TODO TYPES: value spec should accept non-identifier types too
          throw new Error("unimplemented");
        case "TypeIdentifier":
          valueSpec.set(
            prop.identifier.value,
            prop.typeTag.typeExpression.value
          );
          break;
        default:
          throw exhaustive(prop.typeTag.typeExpression);
      }
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
