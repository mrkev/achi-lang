import React, { useCallback, useEffect, useRef } from "react";
import Editor, { EditorProps } from "@monaco-editor/react";
import monaco from "monaco-editor";

/** @returns editor component, editor object ref */
export function useEditor(
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
export function useKeyboardShortcuts(doEvaluate: () => void) {
  useEffect(() => {
    const onKeyDown = function (e: KeyboardEvent) {
      // Cmd+S
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
}
