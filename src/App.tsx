import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Editor, { EditorProps } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import monaco, { editor } from "monaco-editor";
import useLocalStorage from "react-use-localstorage";
import { System } from "./interpreter/runtime/System";
import { interpret } from "./interpreter/interpreter";
import { tryParse } from "./parser/parser";
import { compileProgram, printTSStatements } from "./compiler/compiler";
import { ScopeError } from "./interpreter/Context";
import { check } from "./checker/checker";

const DEFAULT_SCRIPT =
  `
class Point(x: number, y: number);
const one = 1;
const point = Point(x: one, y: 2);
#log point
`.trim() + "\n";

// TODO: can return from top-level, print that?

const options: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 18,
  insertSpaces: true,
  tabSize: 2,
  detectIndentation: false,
  minimap: { enabled: false },
} as const;

function useEditor(
  props: Omit<EditorProps, "onMount">
): [
  React.ReactElement,
  React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
] {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
    },
    []
  );

  return [<Editor {...props} onMount={handleEditorDidMount} />, editorRef];
}

function App() {
  const [initialScript, setInitialScript] = useLocalStorage(
    "script",
    DEFAULT_SCRIPT
  );
  const [log, setLog] = useState<(Error | string)[]>([]);
  const scriptEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const astEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [tsEditor, tsEditorRef] = useEditor({
    language: "typescript",
    height: "50vh",
    theme: "vs-dark",
    options,
  });

  const handleAstEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      astEditorRef.current = editor;
    },
    []
  );

  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      scriptEditorRef.current = editor;
    },
    []
  );

  useEffect(() => {
    const onKeyDown = function (e: KeyboardEvent) {
      if (e.key === "s" && e.metaKey) {
        e.preventDefault();
        doEvaluate();
      }
    };

    document.addEventListener("keydown", onKeyDown, false);
    () => {
      document.removeEventListener("keydown", onKeyDown, false);
    };
  }, []);

  function doEvaluate() {
    const system = new System();

    try {
      const editor = scriptEditorRef.current;
      if (!editor) {
        throw new Error("no editor");
      }

      const script = editor.getValue();
      setInitialScript(script);

      const ast = tryParse(script);
      console.log("HERE");
      astEditorRef.current?.setValue(JSON.stringify(ast, null, 2));
      const tsAst = compileProgram(ast);

      const printed =
        tsAst instanceof Error
          ? "# Compiler error\n" + tsAst.message + "\n" + tsAst.stack
          : printTSStatements(tsAst);
      tsEditorRef.current?.setValue(printed);

      check(script, undefined, system);
      interpret(script, system);
    } catch (e) {
      if (e instanceof Error || typeof e === "string") {
        system.console.log(e);
      }
      console.error(e);
    }
    console.log("done.");
    setLog(system.console._log);
  }

  return (
    <div className="App">
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Editor
          language="achi"
          theme="vs-dark"
          options={options}
          height="50vh"
          // defaultLanguage="text"
          defaultValue={initialScript}
          beforeMount={handleScriptEditorWillMount}
          onMount={handleEditorDidMount}
        />
        {tsEditor}
      </div>

      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "50%", flexShrink: 0 }}>
          <button onClick={doEvaluate}>Evaluate</button>
          <pre>
            {log.map((msg, i) => {
              return msg instanceof Error ? (
                <details style={{ color: "red" }} key={i}>
                  <summary>{msg.message}</summary>
                  {msg.stack}
                </details>
              ) : (
                <span key={i}>
                  {msg}
                  <br />
                </span>
              );
            })}
          </pre>
        </div>
        <Editor
          language="json"
          theme="vs-dark"
          height="50vh"
          // options={options}

          // defaultLanguage="text"
          // defaultValue={initialScript}
          onMount={handleAstEditorDidMount}
        />
      </div>
    </div>
  );
}

export default App;

function handleScriptEditorWillMount(monaco: Monaco) {
  // https://ohdarling88.medium.com/4-steps-to-add-custom-language-support-to-monaco-editor-5075eafa156d
  monaco.languages.register({ id: "achi" });
  monaco.languages.setMonarchTokensProvider("achi", {
    keywords: [
      "abstract",
      "and",
      "break",
      "case",
      "catch",
      "class",
      "classes",
      "const",
      "continue",
      "do",
      "else",
      "enum",
      "false",
      "finally",
      "for",
      "from",
      "function",
      "if",
      "import",
      "interface",
      "match",
      "matches",
      "methods",
      "new",
      "or",
      "private",
      "protected",
      "public",
      "return",
      "static",
      "statics",
      "super",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "unless",
      "when",
      "while",
      "with",
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    // This and other things taken from https://microsoft.github.io/monaco-editor/monarch.html
    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        [
          /[a-zA-Z][\w$]*/,
          {
            cases: {
              "@keywords": "keyword",
              "@default": "variable",
            },
          },
        ],
        // whitespace
        { include: "@whitespace" },

        // delimiters and operators
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

        // strings
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

        // other
        [/\/\//, "comment"],
        [/\d+/, "number"],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\/\*/, "comment", "@push"], // nested comment
        ["\\*/", "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/\/\*/, "comment", "@comment"],
        // [/\/\/.*$/, "comment"],
      ],
    },

    operators: [
      "=",
      ">",
      "<",
      "!",
      "~",
      "?",
      ":",
      "==",
      "<=",
      "=>",
      ">=",
      "!=",
      "&&",
      "||",
      "++",
      "--",
      "+",
      "-",
      "*",
      "/",
      "&",
      "|",
      "^",
      "%",
      "<<",
      ">>",
      ">>>",
      "+=",
      "-=",
      "*=",
      "/=",
      "&=",
      "|=",
      "^=",
      "%=",
      "<<=",
      ">>=",
      ">>>=",
    ],
  });
}
function compileStatement(value: any): any {
  throw new Error("Function not implemented.");
}
