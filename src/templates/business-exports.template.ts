import * as changeCase from "change-case"

export function getBusinessExportsTemplate(featureName: string): string {
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase();

  return `export 'models/${snakeCaseFeatureName}_state.dart';
`
}
