import Editor, { EditorProps } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import React, { useCallback, useEffect, useState } from "react";

/** @returns editor component, editor object ref */
export function useEditor(
  props: Omit<EditorProps, "onMount">,
  highlight?: monaco.Range | null,
  breakpoints?: Set<number>
): [React.ReactElement, editor.IStandaloneCodeEditor | null] {
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(
    null
  );

  const editorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    setEditor(editor);
  }, []);

  useEffect(() => {
    const removeAllDecorations = () => {
      const model = editor?.getModel?.();
      model?.deltaDecorations(
        model?.getAllDecorations().map((x) => x.id),
        []
      );
    };

    if (!editor) {
      return removeAllDecorations;
    }

    const model = editor.getModel();
    if (!model) {
      return removeAllDecorations;
    }

    // remove all decorations
    model.deltaDecorations(
      model.getAllDecorations().map((x) => x.id),
      []
    );

    const decorations: editor.IModelDeltaDecoration[] = [];

    if (highlight != null) {
      // add
      decorations.push({
        range: highlight,
        options: {
          inlineClassName: "myInlineDecoration",
        },
      });
    }

    for (const line of breakpoints ?? []) {
      decorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: "myContentClass",
          glyphMarginClassName: "myGlyphMarginClass",
        },
      });
    }

    if (decorations.length > 0) {
      editor.createDecorationsCollection(decorations);
    }
  }, [highlight, editor, breakpoints]);

  return [<Editor {...props} onMount={editorDidMount} />, editor];
}
