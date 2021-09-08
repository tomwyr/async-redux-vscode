import * as changeCase from "change-case"

export function getBusinessExportsTemplate(featureName: string): string {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase())

  return `export 'models/${snakeCaseFeatureName}_state.dart';
`
}
