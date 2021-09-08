import * as changeCase from "change-case"

export function getClientExportsTemplate(
  featureName: string,
  widgetSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
): string {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase())
  const snakeCaseWidgetSuffix = changeCase.snakeCase(widgetSuffix.toLowerCase())

  const widgetName = `${snakeCaseFeatureName}_${snakeCaseWidgetSuffix}`

  let connectorName = snakeCaseFeatureName
  if (connectorIncludeWidgetSuffix) {
    connectorName += `_${snakeCaseWidgetSuffix}`
  }
  connectorName += "_connector"

  const viewModelName = `${snakeCaseFeatureName}_view_model`
  const viewModelFactoryName = `${snakeCaseFeatureName}_view_model_factory`

  return `export '${widgetName}.dart';
export '${connectorName}.dart';
export '${viewModelName}.dart';
export '${viewModelFactoryName}.dart';
`
}
