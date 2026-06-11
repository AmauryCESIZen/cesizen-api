const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toSnakeCase = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase) as T;
  if (obj instanceof Date) return obj as T;
  if (typeof obj !== "object") return obj as T;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = toSnakeCase(value);
  }
  return result as T;
};
