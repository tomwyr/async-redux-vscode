import * as changeCase from "change-case"

export function getClientExportsTemplate(
  featureName: string,
  widgetSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
): string {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase())
  const snakeCaseWidgetSuffix = changeCase.snakeCase(widgetSuffix.toLowerCase())

  let connectorName = snakeCaseFeatureName;
  if (connectorIncludeWidgetSuffix) {
    connectorName += `_${snakeCaseWidgetSuffix}`
  }
  connectorName += "_connector"

  return `export '${connectorName}.dart';
`;
}
