import * as changeCase from "change-case"

export function getClientExportsTemplate(
  featureName: string,
  widgetSuffix: string,
  connectorSuffix: string,
  connectorIncludeWidgetSuffix: boolean
): string {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());
  const snakeCaseWidgetSuffix = changeCase.snakeCase(widgetSuffix);
  const snakeCaseConnectorSuffix = changeCase.snake(connectorSuffix);

  let connectorName = snakeCaseFeatureName;
  if (connectorIncludeWidgetSuffix) {
    connectorName += `_${snakeCaseWidgetSuffix}`
  }
  connectorName += "_connector";
  if (snakeCaseConnectorSuffix.length > 0) {
    connectorName += `_${snakeCaseConnectorSuffix}`;
  }

  return `export '${connectorName}.dart';
`;
}
