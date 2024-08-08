import { Scope } from "../interpreter/Context";
import { ValueType } from "../interpreter/runtime/value";
import { printableOfValue } from "../interpreter/stringOfValue";

export function ValueScope({
  scope,
}: {
  scope: Scope<string, ValueType["Value"]>;
}) {
  return (
    <div>
      <b>Value Scope</b>
      {[...scope._stack.keys()].map((i) => {
        const map = scope._stack[i];
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            {i}:
            <ValueMap map={map} />
          </div>
        );
      })}
    </div>
  );
}

export function ValueMap({ map }: { map: Map<string, ValueType["Value"]> }) {
  return (
    <table>
      <tbody>
        {[...map.entries()].map(([key, value], i) => {
          return (
            <tr key={key}>
              <td
                // https://stackoverflow.com/questions/69486887/styling-table-borders-with-css
                style={{
                  width: "0.1%",
                  whiteSpace: "nowrap",
                }}
              >
                {key}
              </td>
              <td>
                <pre style={{ margin: 0, padding: 0 }}>
                  {printableOfValue(value)}
                </pre>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
