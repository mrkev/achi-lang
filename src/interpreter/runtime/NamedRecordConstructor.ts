import type { LangType } from "../../parser/parser";
import { Value } from "../interpreter";

/**
 * Represents the constructor for a named record, as it sits in memory
 * ready to be instantiated.
 */
export class NamedRecordKlass {
  readonly classname: string;
  readonly valueSpec: Map<string, string> = new Map(); // identifer => type
  constructor(classname: string, valueSpec: Map<string, string>) {
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
    const res = new NamedRecordKlass(classname, valueSpec);
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

export class RecordLiteralInstance {
  ast: LangType["RecordLiteral"];
  props: Map<string, Value>;
  constructor(ast: LangType["RecordLiteral"], props: Map<string, Value>) {
    this.ast = ast;
    this.props = props;
  }
}
