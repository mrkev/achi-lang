export function nullthrows<T>(val: T | null | undefined, msg?: string): T {
  if (val == null) {
    throw new Error(msg ?? `unexpected nullable found`);
  }
  return val;
}

export function exhaustive(a: never, msg?: string) {
  return new Error(msg ?? `Non-exhaustive: ${a} went through`);
}
