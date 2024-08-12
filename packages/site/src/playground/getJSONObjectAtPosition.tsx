import { editor, Position } from "monaco-editor";
import * as monaco from "monaco-editor";

export function getJSONObjectAtPosition(
  position: Position,
  editor: editor.IStandaloneCodeEditor
): Error | string {
  const model = editor.getModel();
  if (!model) {
    return new Error("no model");
  }

  const allText = model.getValue();

  const goingBack = model.getValueInRange(
    new monaco.Range(0, 0, position.lineNumber, position.column)
  );

  let sq = 0;
  let cb = 0;
  let startChar = 0;

  // Go back, find a {, but keeping braces balanced, so we find the { we want
  // (ie, at our level) instead of just the first one we find going bakc (ie,
  // the peak of a 'pyramid').
  for (let i = goingBack.length - 1; i > -1; i--) {
    if (goingBack[i] === "[") {
      // We break at arrays, just so we don't go to the top of the program
      // TODO: find the object "ABOVE" the array.
      if (sq === 0 && cb === 0) {
        startChar = i;
        break;
      }
      sq++;
    } else if (goingBack[i] === "{") {
      if (sq === 0 && cb === 0) {
        startChar = i;
        break;
      }
      cb++;
    } else if (goingBack[i] === "]") {
      sq--;
    } else if (goingBack[i] === "}") {
      cb--;
    }
  }

  const str = allText.slice(startChar);

  let openSquareBrackets = 0;
  let openCurlyBraces = 0;
  let endIndex = 0;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "[") {
      openSquareBrackets++;
    } else if (str[i] === "{") {
      openCurlyBraces++;
    } else if (str[i] === "]") {
      openSquareBrackets--;
    } else if (str[i] === "}") {
      openCurlyBraces--;
    }

    if (openSquareBrackets === 0 && openCurlyBraces === 0) {
      endIndex = i;
      break;
    }
  }

  return str.substring(0, endIndex + 1);
}
