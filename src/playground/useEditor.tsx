import React, { useEffect, useState } from "react";
import Editor, { EditorProps } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import * as monaco from "monaco-editor";

/** @returns editor component, editor object ref */
export function useEditor(
  props: Omit<EditorProps, "onMount">,
  decoration?: monaco.Range | null
): [React.ReactElement, editor.IStandaloneCodeEditor | null] {
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(
    null
  );

  const editorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    setEditor(editor);
  };

  useEffect(() => {
    const removeAll = () => {
      const model = editor?.getModel?.();
      model?.deltaDecorations(
        model?.getAllDecorations().map((x) => x.id),
        []
      );
    };

    if (!editor) {
      return removeAll;
    }
    const model = editor.getModel();
    if (!model) {
      return removeAll;
    }

    if (!decoration) {
      // remove
      model.deltaDecorations(
        model.getAllDecorations().map((x) => x.id),
        []
      );
    } else {
      // remove
      model.deltaDecorations(
        model.getAllDecorations().map((x) => x.id),
        []
      );
      // add
      editor.deltaDecorations(
        [],
        [
          {
            range: decoration,
            options: {
              inlineClassName: "myInlineDecoration",
            },
          },
        ]
      );
    }
  }, [decoration, editor]);

  return [<Editor {...props} onMount={editorDidMount} />, editor];
}
