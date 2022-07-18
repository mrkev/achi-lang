export function nullthrows<T>(val: T | null | undefined, msg?: string): T {
  if (val == null) {
    throw new Error(msg ?? `unexpected nullable found`);
  }
  return val;
}

export function exhaustive(a: never) {
  throw new Error(`Non-exhaustive: ${a} went through`);
}
