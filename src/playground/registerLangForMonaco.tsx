import { Monaco } from "@monaco-editor/react";

export function registerLangForMonaco(monaco: Monaco) {
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
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

        // other
        [/\/\//, "comment"],
        [/\d+/, "number"],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\/\*/, "comment", "@push"],
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
