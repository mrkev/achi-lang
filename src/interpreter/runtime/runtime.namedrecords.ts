import type { LangType } from "../../parser/parser";
import { RuntimeType, runtimeTypeOfTypeExpression } from "./runtimeType";
import { ValueI, ValueType } from "./value";

/**
 * Represents the constructor for a named record, as it sits in memory
 * ready to be instantiated.
 */
export class NamedRecordKlass implements ValueI {
  readonly kind = "NamedRecordKlass";

  readonly classname: string;
  readonly valueSpec: Map<string, RuntimeType["RuntimeType"]> = new Map(); // identifer => type
  readonly src: LangType["NamedRecordDefinition"];

  private constructor(
    ast: LangType["NamedRecordDefinition"],
    classname: string,
    valueSpec: Map<string, RuntimeType["RuntimeType"]>
  ) {
    this.src = ast;
    this.classname = classname;
    this.valueSpec = valueSpec;
  }

  static fromNamedRecordDefinition(
    def: LangType["NamedRecordDefinition"]
  ): NamedRecordKlass {
    const classname = def.identifier.value;
    const valueSpec = new Map<string, RuntimeType["RuntimeType"]>();
    for (const prop of def.record.definitions) {
      valueSpec.set(
        prop.identifier.value,
        runtimeTypeOfTypeExpression(prop.typeTag.typeExpression)
      );
    }
    const res = new NamedRecordKlass(def, classname, valueSpec);
    return res;
  }
}

// TODO: this should take some record type type, not a named record type type
export function checkRecordType(
  recordInstance: ValueType["RecordInstance"],
  namedRecordKlass: NamedRecordKlass
) {
  const recordProps = new Set(recordInstance.props.keys());

  for (const [propKey, type] of namedRecordKlass.valueSpec) {
    const value = recordInstance.props.get(propKey);
    if (value == null) {
      throw new Error(
        `Type ${namedRecordKlass.classname} requires prop ${propKey}`
      );
    }
    recordProps.delete(propKey);

    // console.log(propKey, type, recordInstance.props.get(propKey));

    // TODO: typecheck
  }

  if (recordProps.size > 0) {
    throw new Error(
      `Type ${namedRecordKlass.classname} doesnt expect keys: ${Array.from(
        recordProps
      ).join(", ")}`
    );
  }
}
