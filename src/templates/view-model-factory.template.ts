import * as changeCase from "change-case"
import * as constants from "../constants"

export function getViewModelFactoryTemplate(
  featureName: string,
  widgetSuffix: string,
  connectorSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
  viewModelFactoryBaseName: string,
  viewModelFactoryImportPath: string,
  viewModelFactoryIncludeState: boolean,
  stateName: string,
  stateImportPath: string,
): string {
  const pascalCaseFeatureName = changeCase.pascal(featureName);

  let connectorName = `${pascalCaseFeatureName}`;
  if (connectorIncludeWidgetSuffix) {
    connectorName += widgetSuffix;
  }
  connectorName += `Connector${connectorSuffix}`;

  const viewModelName = `${pascalCaseFeatureName}ViewModel`;
  const viewModelFactoryName = `${pascalCaseFeatureName}ViewModelFactory`;

  const snakeCaseConnectorName = changeCase.snake(connectorName);
  const snakeCaseViewModelName = changeCase.snake(viewModelName);

  const viewModelFactoryTypeParameters = [
    ...(viewModelFactoryIncludeState ? [stateName] : []),
    connectorName,
  ].join(`, `)

  let reduxImports = `${constants.asyncRedux.importStatement}`
  if (viewModelFactoryImportPath != constants.asyncRedux.importPath) {
    reduxImports += `\nimport '${viewModelFactoryImportPath}';`
  }
  if (
    viewModelFactoryIncludeState &&
    stateImportPath.length > 0 &&
    stateImportPath != constants.asyncRedux.importPath
  ) {
    reduxImports += `\nimport '${stateImportPath}';`
  }

  const featureImports = [snakeCaseConnectorName, snakeCaseViewModelName]
    .map((item) => `import '${item}.dart';`)
    .join("\n");

  return `${reduxImports}

${featureImports}
  
class ${viewModelFactoryName} extends ${viewModelFactoryBaseName}<${viewModelFactoryTypeParameters}> {
  @override
  Vm fromStore() => ${viewModelName}();
}
`
}
