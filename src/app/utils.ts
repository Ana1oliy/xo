export function getFilledArray<T>(size: number, value: T): T[] {
  const result: T[] = [];
  result.length = size;
  return result.fill(value);
}
