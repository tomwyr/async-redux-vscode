import * as changeCase from "change-case"

export function getFreezedStateTemplate(
  featureName: string,
  useFullFeatureNames: boolean,
): string {
  const pascalCaseFeatureName = changeCase.pascal(featureName)
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  const featureStateName = `${pascalCaseFeatureName}State`

  let fileName = ""
  if (useFullFeatureNames) fileName += `${snakeCaseFeatureName}_`
  fileName += "state"

  return `import 'package:freezed_annotation/freezed_annotation.dart';

part '${fileName}.freezed.dart';

@freezed
class ${featureStateName} with _$${featureStateName} {
  factory ${featureStateName}() = _${featureStateName};
}
`
}
