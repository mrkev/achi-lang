import Parsimmon, { string } from "parsimmon";
import { Context, ScopeError } from "../interpreter/Context";
import { niceError } from "../interpreter/interpreter";
import { exhaustive, nullthrows } from "../interpreter/nullthrows";
import { System } from "../interpreter/runtime/System";
import { LangType, tryParse } from "../parser/parser";
import { isSubtype, Type, printType, RecordType } from "./types";

export function check(
  script: string | LangType["Program"],
  context: Context = Context.create(), // should I make a special "type context"?
  system: System
): void {
  try {
    const ast = typeof script === "string" ? tryParse(script) : script;
    context.typeScope.push();
    resolveTypes(ast.statements, context);
    console.log(context.staticTypes);
    checkStatements(ast.statements, context);
    context.typeScope.pop();
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

function resolveStatementTypes(
  statement: LangType["Statement"],
  context: Context
): void {
  switch (statement.kind) {
    case "IfStatement": {
      // 1. guard
      resolveExpressionTypes(statement.guard, context);
      // 2. block
      resolveTypes(statement.block.statements, context);
      return;
    }
    case "DEBUG_Log": {
      // 1. expression
      resolveExpressionTypes(statement.expression, context);
      return;
    }
    case "ConstantDefinition": {
      // 1. expression
      const expressionType = resolveExpressionTypes(
        statement.expression,
        context
      );
      // 2. identifier
      // TODO: right thing to do?
      context.staticTypes.set(statement.identifier, expressionType);
      return;
    }
    case "NamedRecordDefinitionStatement": {
    }
    case "NamedRecordDefinitionGroup":
    case "DEBUG_LogType":
    case "ReturnStatement":
    case "FunctionCall":
    case "MatchFunction":
    case "MatchExpression":
      throw new Error("not implemented");
    default: {
      throw exhaustive(statement);
    }
  }
}

function resolveExpressionTypes(
  expression: LangType["RecordLiteral"],
  context: Context
): RecordType;
function resolveExpressionTypes(
  expression: LangType["Expression"],
  context: Context
): Type;
function resolveExpressionTypes(
  expression: LangType["Expression"],
  context: Context
): Type {
  switch (expression.kind) {
    case "BooleanLiteral": {
      // 1. self
      const selfType = {
        kind: "booleanLiteral",
        value: expression.value,
      } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "NumberLiteral": {
      // 1. self
      const selfType = {
        kind: "numberLiteral",
        value: expression.value,
      } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "StringLiteral": {
      // 1. self
      const selfType = {
        kind: "stringLiteral",
        value: expression.value,
      } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "RecordLiteral": {
      const shape = new Map<string, Type>();
      // 1. definitions
      for (const definition of expression.definitions) {
        const definitionType = resolveExpressionTypes(
          definition.expression,
          context
        );
        shape.set(definition.identifier.value, definitionType);
      }
      // 2. self
      const selfType = { kind: "record", shape } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "NamedRecordLiteral": {
      // 1. Record literal
      const recordLiteralType = resolveExpressionTypes(
        expression.recordLiteral,
        context
      );
      // 2. self
      const selfType = {
        kind: "namedRecord",
        name: "TODO:NamedRecordLiteral:typename",
        recordType: recordLiteralType,
      } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "AnonymousFunctionLiteral": {
      // 1. argument
      const argumentType = resolveDefinitionType(expression.argument, context);
      // 2. self
      const selfType = {
        kind: "function",
        argumentType,
        // TODO: functions return any!!
        returnType: { kind: "any" },
      } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "MapLiteral": {
      let valueType: Type | null = null;
      // 1. valueType: TODO: instead of using the type of the first value, use
      //                     the union of the type of all values
      if (expression.entries.length > 0) {
        valueType = resolveExpressionTypes(
          expression.entries[0].expression,
          context
        );
      } else {
        valueType = { kind: "any" };
      }
      // 2. self
      const selfType = { kind: "map", valueType } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "ListLiteral": {
      let valueType: Type | null = null;
      // 1. valueType: TODO: instead of using the type of the first value, use
      //                     the union of the type of all values
      if (expression.expressions.length > 0) {
        valueType = resolveExpressionTypes(expression.expressions[0], context);
      } else {
        valueType = { kind: "any" };
      }
      // 2. self
      const selfType = { kind: "list", valueType } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "MatchExpression": {
      // TODO: any
      const selfType = { kind: "any" } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "ValueIdentifier": {
      // 1. self
      // TODO any
      const selfType = { kind: "reference" } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    case "FunctionCall": {
      // 1. self
      // TODO any
      const selfType = { kind: "any" } as const;
      context.staticTypes.set(expression, selfType);
      return selfType;
    }

    default: {
      throw exhaustive(expression);
    }
  }
}

/*
Definition types get attatched to the identifier. For example:

const foo: (x: number, y: number) = (x: 3)
      vvv                           vvvvvv
      |                             Has type (x: number)
      +-> Has type (x: number, y: number)

Eventually this is a type error since we notice:
  (x: number, y: number) !> (x: number). 
  
If the defintion had been made without a type:

const foo = (x: 3)
            vvvvvv
            Has type (x: number)

At resolution type the type for `foo` would just be set
to the type of its exprssion:

const foo = (x: 3)
      vvv   vvvvvv
      |     Has type (x: number)
      +-> Gets assigned type (x: number)
*/
function resolveDefinitionType(
  definition: LangType["RecordDefinition"],
  context: Context
): RecordType;
function resolveDefinitionType(
  definition: LangType["RecordDefinition"] | LangType["TypeTag"],
  context: Context
): Type;
function resolveDefinitionType(
  definition: LangType["RecordDefinition"] | LangType["TypeTag"],
  context: Context
): Type {
  switch (definition.kind) {
    case "RecordDefinition": {
      const shape = new Map<string, Type>();
      for (const def of definition.definitions) {
        const definitionType = resolveDefinitionType(def.typeTag, context);
        shape.set(def.identifier.value, definitionType);
      }
      const selfType = { kind: "record", shape } as const;
      return selfType;
    }

    case "TypeTag": {
      /// TODOOOOOOOOOOO any
      return { kind: "any" };
    }

    default: {
      throw exhaustive(definition);
    }
  }
}

function resolveTypes(
  statements: LangType["Statement"][],
  context: Context
): void {
  for (const statement of statements) {
    resolveStatementTypes(statement, context);
  }
}

///
// todo: Idea: instead of everything being an identifier, identifiers at definitons are
// ValueIdentifier/TypeIdentifier. Identifiers at usage are IdentifierReference
export function typeOf(
  expression: LangType["Expression"],
  scope: Context
): Type {
  const expressionType = scope.staticTypes.get(expression);
  if (expressionType == null) {
    throw new Error("didnt find type for expression");
  }

  if (expressionType.kind === "reference") {
    if (expression.kind !== "ValueIdentifier") {
      throw new Error("refernce type on non-identifer; this shouldn't happen.");
    }
    const originalIdentifier = scope.identifierNodeMap.get(expression.value);
    if (
      originalIdentifier == null ||
      // TODO: what to do with "TypeIdentifier"
      originalIdentifier.kind === "TypeIdentifier"
    ) {
      throw new Error("didnt find type for identifier or was TypeIdentifier");
    }
    const referenceType = scope.staticTypes.get(originalIdentifier);
    if (referenceType == null) {
      throw new Error("didnt find type for identifier rip");
    }
    return referenceType;
  }

  return expressionType;
}

function checkStatements(
  statements: LangType["Statement"][],
  context: Context
): void {
  for (const statement of statements) {
    const { kind } = statement;
    switch (kind) {
      // if (...) { ... }
      case "IfStatement": {
        // 1: guard must be boolean
        const guardType = typeOf(statement.guard, context);
        if (!isSubtype(guardType, { kind: "boolean" })) {
          throw new TypeMismatchError(
            statement.guard,
            { kind: "boolean" },
            guardType
          );
        }
        break;
      }

      // const foo = ...
      case "ConstantDefinition": {
        // TODO: IDEA: save type info in a map; node ref => type.
        // any expression is a "typeable node", but others are not (?)
        // so it's really an "expression node" => type map.
        // We gotta make sure our AST is readonly in this case!
        // const valueType = typeOf(statement.expression, context);
        // context.types.set(statement.identifier.value, valueType);
      }

      case "DEBUG_Log":
      case "DEBUG_LogType": {
        break;
      }

      case "NamedRecordDefinitionStatement":
      case "NamedRecordDefinitionGroup":
      case "ReturnStatement":
      case "FunctionCall":
      case "MatchFunction":
      case "MatchExpression":
        throw new Error("Not implemented " + kind);
      default: {
        throw exhaustive(kind);
      }
    }
  }
}

function checkExpression(
  expression: LangType["Expression"],
  context: Context
): void {}

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
