import * as changeCase from "change-case"

export function getFreezedStateTemplate(featureName: string): string {
  const pascalCaseFeatureName = changeCase.pascal(featureName)
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  const featureStateName = `${pascalCaseFeatureName}State`

  return `import 'package:freezed_annotation/freezed_annotation.dart';

part '${snakeCaseFeatureName}.freezed.dart';

@freezed
class ${featureStateName} with _$${featureStateName} {
  factory ${featureStateName}() = _${featureStateName};
}
`
}
