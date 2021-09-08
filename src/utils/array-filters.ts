export function distinct<T>(item: T, index: number, array: T[]) {
  return array.indexOf(item) == index
}
