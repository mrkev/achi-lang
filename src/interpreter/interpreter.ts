import { LangType } from "../parser/parser";
import { evaluateExpression } from "./evaluateExpression";

export function exhaustive(a: never) {
  throw new Error("");
}

/**
 * Represents the constructor for a named record
 */
class NamedRecordConstructor {
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
    console.log(res.asClass());
    return res;
  }

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
    if (!context.types.has(expression.identifier.value)) {
      throw new Error(`No definition for ${expression.identifier.value} found`);
    }
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

function stringOfValue(value: Value): string {
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

export type Context = Readonly<{
  types: Map<string, NamedRecordConstructor>;
  values: Map<string, Value>;
}>;

function newContext(): Context {
  return {
    types: new Map(),
    // TODO: standard types, like records?
    values: new Map(),
  };
}

export function evaluate(ast: LangType["Program"], log: (string | Error)[]) {
  const context = newContext();

  for (const statement of ast) {
    const { kind } = statement;
    switch (kind) {
      case "NamedRecordDefinition":
        if (context.types.has(statement.identifier.value)) {
          console.warn("Overriding definition for", statement.identifier.value);
        }
        const konstructor =
          NamedRecordConstructor.fromNamedRecordDefinition(statement);
        context.types.set(statement.identifier.value, konstructor);
        break;

      case "ConstantAssignment":
        if (context.values.has(statement.identifier.value)) {
          console.warn("Overriding definition for", statement.identifier.value);
        }
        const result = evaluateExpression(statement.expression, context);
        context.values.set(statement.identifier.value, result);
        break;

      case "DEBUG_Log":
        const value = evaluateExpression(statement.expression, context);
        console.log("#log", stringOfValue(value), value);
        log.push(stringOfValue(value));
        break;
      default:
        exhaustive(kind);
    }
  }
}
