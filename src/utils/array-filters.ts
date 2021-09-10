export function distinct<T>(item: T, index: number, array: T[]) {
  return array.indexOf(item) == index
}

export function notEmpty(item: string, _index: number, _array: string[]) {
  return item.length > 0
}
