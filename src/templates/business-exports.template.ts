import * as changeCase from "change-case"

export function getBusinessExportsTemplate(
  featureName: string,
  useFullFeatureNames: boolean,
): string {
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()

  let stateFileName = ""
  if (useFullFeatureNames) stateFileName += `${snakeCaseFeatureName}_`
  stateFileName += "state.dart"

  return `export 'models/${stateFileName}';
`
}
