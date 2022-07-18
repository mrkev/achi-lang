import { LangType, tryParse } from "../parser/parser";
import { evaluateExpression } from "./evaluateExpression";
import { Context } from "./Context";
import { System } from "./System";
import { exhaustive } from "./nullthrows";
import { evaluateStatements } from "./evaluateStatements";

export function interpret(script: string, system: System) {
  try {
    const ast = tryParse(script);
    const context = Context.create();
    evaluateStatements(ast.statements, context, system);
  } catch (e) {
    system.console.log(e as Error);
    console.error(e);
  }
}

// TODO: evaluation tests

/**
 * Represents the constructor for a named record, as it sits in memory
 * ready to be instantiated.
 */
export class NamedRecordConstructor {
  readonly classname: string;
  readonly valueSpec: Map<string, string> = new Map(); // identifer => type
  constructor(classname: string, valueSpec: Map<string, string>) {
    this.classname = classname;
    this.valueSpec = valueSpec;
  }

  static fromNamedRecordDefinition(
    def: LangType["NamedRecordDefinition"]
  ): NamedRecordConstructor {
    const classname = def.identifier.value;
    const valueSpec = new Map<string, string>();
    for (const prop of def.record.definitions) {
      valueSpec.set(prop.identifier.value, prop.typeTag.identifier.value);
    }
    const res = new NamedRecordConstructor(classname, valueSpec);
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

export class NamedRecordInstance {
  readonly konstructor: NamedRecordConstructor;
  readonly props: Map<string, Value>;
  constructor(konstructor: NamedRecordConstructor, props: Map<string, Value>) {
    this.konstructor = konstructor;
    this.props = props;
  }

  static fromNamedRecordLiteral(
    expression: LangType["NamedRecordLiteral"],
    context: Context
  ) {
    // if (!context.types.has(expression.identifier.value)) {
    //   throw new Error(`No definition for ${expression.identifier.value} found`);
    // }
    const konstructor = context.types.get(expression.identifier.value);
    if (!(konstructor instanceof NamedRecordConstructor)) {
      throw new Error(
        `Type ${expression.identifier.value} is not a named record`
      );
    }

    // TODO: typecheck
    // konstructor.valueSpec

    const props = new Map();
    for (const def of expression.recordLiteral.definitions) {
      props.set(
        def.identifier.value,
        evaluateExpression(def.expression, context)
      );
    }

    const instance = new NamedRecordInstance(konstructor, props);
    return instance;
  }
}

export type Value =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "NamedRecord"; value: NamedRecordInstance };
// | { kind: "Record"; value: any };

export function stringOfValue(value: Value): string {
  const { kind } = value;
  switch (kind) {
    case "number":
    case "string":
    case "boolean": {
      return String(value.value);
    }
    case "NamedRecord": {
      let str = value.value.konstructor.classname + " { \n";
      for (const [key, val] of value.value.props.entries()) {
        str += `  ${key}: ${stringOfValue(
          val
        )} (${value.value.konstructor.valueSpec.get(key)})\n`;
      }
      str += "}";
      return str;
    }
    default:
      throw exhaustive(kind);
  }
}
