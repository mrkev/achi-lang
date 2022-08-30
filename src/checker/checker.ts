import Parsimmon from "parsimmon";
import { Context, ScopeError } from "../interpreter/Context";
import { niceError } from "../interpreter/interpreter";
import { exhaustive } from "../interpreter/nullthrows";
import { System } from "../interpreter/runtime/System";
import { LangType, tryParse } from "../parser/parser";

export function check(
  script: string | LangType["Program"],
  context: Context = Context.create(), // should I make a special "type context"?
  system: System
): void {
  try {
    const ast = typeof script === "string" ? tryParse(script) : script;
    context.pushScope();
    checkStatements(ast.statements, context);
    context.popScope();
  } catch (e) {
    if (e instanceof ScopeError) {
      if (typeof script === "string") {
        const nice = niceError(script, e);
        system.console.log(nice);
      }
    } else if (e instanceof TypeMismatchError) {
      if (typeof script === "string") {
        const nice = niceError(script, e);
        system.console.log(nice);
      }
    } else if (e instanceof Error || typeof e === "string") {
      system.console.log(e);
    } else {
      console.log("Unknown error type during interpretation");
    }
    console.error(e);
  }
}

function checkStatements(
  statements: LangType["Statement"][],
  context: Context
): void {
  for (const statement of statements) {
    const { kind } = statement;
    switch (kind) {
      // Check boolean guard
      case "IfStatement": {
        const guardType = typeOf(statement.guard, context);
        if (!isSubtype(guardType, { kind: "boolean" })) {
          throw new TypeMismatchError(
            statement.guard,
            { kind: "boolean" },
            guardType
          );
        }
      }

      case "NamedRecordDefinitionStatement":
      case "NamedRecordDefinitionGroup":
      case "ConstantDefinition":
      case "DEBUG_Log":
      case "DEBUG_LogType":
      case "ReturnStatement":
      case "FunctionCall":
      case "MatchFunction":
      case "MatchExpression":
        throw new Error("Not implemented");
      default: {
        throw exhaustive(kind);
      }
    }
  }
}

export class TypeMismatchError {
  expression: LangType["Expression"];
  expected: Type;
  got: Type;
  constructor(expression: LangType["Expression"], expected: Type, got: Type) {
    this.expression = expression;
    this.expected = expected;
    this.got = got;
  }

  location(): Readonly<{ start: Parsimmon.Index; end: Parsimmon.Index }> {
    const loc = {
      offset: 0,
      line: 1,
      column: 1,
    };
    return { start: loc, end: loc };
  }

  print(): string {
    return `Invalid type. Expected ${printType(
      this.expected
    )} but got ${printType(this.got)}.`;
  }
}

type RecordType = { kind: "record"; shape: Map<string, Type> };

type Type =
  | { kind: "string" }
  | { kind: "stringLiteral"; value: string }
  | { kind: "number" }
  | { kind: "numberLiteral"; value: number }
  | { kind: "boolean" }
  | { kind: "booleanLiteral"; value: boolean }
  | { kind: "list"; value: Type }
  | { kind: "map"; value: Type }
  | RecordType
  | { kind: "namedRecord"; name: string; shape: Map<string, Type> }
  | { kind: "function"; argument: RecordType; return: Type };

function printType(type: Type) {
  switch (type.kind) {
    case "string":
    case "number":
    case "boolean":
      return type.kind;
    case "stringLiteral":
    case "numberLiteral":
    case "booleanLiteral":
      return `${type.kind.replace("Literal", "")}(${String(type.value)})`;
    case "list":
    case "map":
    case "record":
    case "namedRecord":
    case "function":
      return "TODO: " + type.kind;
    default: {
      throw exhaustive(type);
    }
  }
}

//
function typeOf(expression: LangType["Expression"], scope: Context): Type {
  switch (expression.kind) {
    case "BooleanLiteral":
      return { kind: "booleanLiteral", value: expression.value };
    case "NumberLiteral":
      return { kind: "numberLiteral", value: expression.value };
    case "StringLiteral":
      return { kind: "stringLiteral", value: expression.value };
    case "ValueIdentifier":
    case "NamedRecordLiteral":
    case "RecordLiteral":
    // case "FunctionDefinition":
    case "FunctionCall":
    case "MatchExpression":
    case "MapLiteral":
    case "ListLiteral":
    case "AnonymousFunctionLiteral":
      throw new Error("typeOf, not implemented");
    default: {
      throw exhaustive(expression);
    }
  }
}

// A <= B
// if function(arg: TypeB) {...}
// is function(x as TypeA) ok
function isSubtype(sub: Type, sup: Type): boolean {
  switch (sup.kind) {
    case "string": {
      switch (sub.kind) {
        case "string":
        case "stringLiteral":
          return true;
        case "number":
        case "numberLiteral":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    }

    case "stringLiteral": {
      switch (sub.kind) {
        case "stringLiteral":
          return sub.value === sup.value;
        case "string":
        case "number":
        case "numberLiteral":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    }
    case "number":
      switch (sub.kind) {
        case "number":
        case "numberLiteral":
          return true;
        case "stringLiteral":
        case "string":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "numberLiteral":
      switch (sub.kind) {
        case "numberLiteral":
          return sup.value === sub.value;
        case "stringLiteral":
        case "string":
        case "number":
        case "boolean":
        case "booleanLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "boolean":
      switch (sub.kind) {
        case "boolean":
        case "booleanLiteral":
          return true;
        case "stringLiteral":
        case "string":
        case "number":
        case "numberLiteral":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "booleanLiteral":
      switch (sub.kind) {
        case "booleanLiteral":
          return sup.value === sub.value;
        case "stringLiteral":
        case "string":
        case "number":
        case "numberLiteral":
        case "boolean":
        case "list":
        case "map":
        case "record":
        case "namedRecord":
        case "function":
          return false;
        default: {
          throw exhaustive(sub);
        }
      }
    case "list":
    case "map":
    case "record":
    case "namedRecord":
    case "function":
      throw new Error("isSubtype, not implemented");
    default: {
      throw exhaustive(sup);
    }
  }
}

// switch (typeA.kind) {
//   case "string": {

//   }

//   case "stringLiteral":
//   case "number":
//   case "numberLiteral":
//   case "boolean":
//   case "booleanLiteral":
//   case "list":
//   case "map":
//   case "record":
//   case "namedRecord":
//   case "function":
//     throw new Error("isSubtype, not implemented");
//   default: {
//     throw exhaustive(typeA);
//   }
// }
