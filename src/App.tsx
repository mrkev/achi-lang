import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import monaco, { editor } from "monaco-editor";
import useLocalStorage from "react-use-localstorage";
import { System } from "./interpreter/System";
import { interpret } from "./interpreter/interpreter";

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
};

function App() {
  const [initialScript, setInitialScript] = useLocalStorage(
    "script",
    DEFAULT_SCRIPT
  );
  const [log, setLog] = useState<(Error | string)[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      // here is the editor instance
      // you can store it in `useRef` for further usage
      editorRef.current = editor;
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
      const editor = editorRef.current;
      if (!editor) {
        throw new Error("no editor");
      }

      const script = editor.getValue();
      setInitialScript(script);

      interpret(script, system);
    } catch (e) {
      system.console.log(e as Error);
      console.error(e);
    }
    console.log("done.");
    setLog(system.console._log);
  }

  return (
    <div className="App">
      <Editor
        language="achi"
        theme="vs-dark"
        options={options}
        height="40vh"
        // defaultLanguage="text"
        defaultValue={initialScript}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
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
  );
}

export default App;

function handleEditorWillMount(monaco: Monaco) {
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
