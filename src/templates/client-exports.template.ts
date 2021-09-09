import * as changeCase from "change-case"

export function getClientExportsTemplate(
  featureName: string,
  widgetSuffix: string,
  connectorSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
  useFullFeatureNames: boolean,
): string {
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  const snakeCaseWidgetSuffix = changeCase.snake(widgetSuffix)
  const snakeCaseConnectorSuffix = changeCase.snake(connectorSuffix)

  let connectorName = ""
  if (useFullFeatureNames) connectorName += `${snakeCaseFeatureName}_`
  if (connectorIncludeWidgetSuffix) {
    connectorName += `${snakeCaseWidgetSuffix}_`
  }
  connectorName += "connector"
  if (snakeCaseConnectorSuffix.length > 0) {
    connectorName += `_${snakeCaseConnectorSuffix}`
  }

  return `export '${connectorName}.dart';
`
}
