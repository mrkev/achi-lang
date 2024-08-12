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
  readonly valueSpec: Map<string, RuntimeType["RuntimeType"]>; // identifer => type
  readonly methods: Map<string, null>;
  readonly src:
    | LangType["NamedRecordDefinition"]
    | LangType["NamedRecordDefinitionStatement"];

  private constructor(
    ast: LangType["NamedRecordDefinition"],
    classname: string,
    valueSpec: Map<string, RuntimeType["RuntimeType"]>,
    methods: Map<string, null> = new Map()
  ) {
    this.src = ast;
    this.classname = classname;
    this.valueSpec = valueSpec;
    this.methods = methods;
  }

  // Creates a class object from a NamedRecordDefinition. Attatches methods if necessary
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

  static fromNamedRecordDefinitionStatement(
    def: LangType["NamedRecordDefinitionStatement"]
  ): NamedRecordKlass {
    const classname = def.namedRecordDefinition.identifier.value;
    const valueSpec = new Map<string, RuntimeType["RuntimeType"]>();
    const methods = new Map<string, null>();

    // TODO: set types for methods
    for (const prop of def.namedRecordDefinition.record.definitions) {
      valueSpec.set(
        prop.identifier.value,
        runtimeTypeOfTypeExpression(prop.typeTag.typeExpression)
      );
    }

    const res = new NamedRecordKlass(
      def.namedRecordDefinition,
      classname,
      valueSpec,
      methods
    );
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
