import * as changeCase from "change-case"
import * as constants from "../constants"

export function getConnectorTemplate(
  featureName: string,
  widgetSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
  stateName: string,
  stateImportPath: string,
): string {
  const pascalCaseFeatureName = changeCase.pascalCase(featureName.toLowerCase())
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase())

  let connectorName = pascalCaseFeatureName
  if (connectorIncludeWidgetSuffix) connectorName += widgetSuffix
  connectorName += "Connector"

  const widgetName = `${pascalCaseFeatureName}${widgetSuffix}`
  const viewModelName = `${pascalCaseFeatureName}ViewModel`
  const viewModelFactoryName = `${pascalCaseFeatureName}ViewModelFactory`
  const storeConnectorTypeParameters = `${stateName}, ${viewModelName}`

  let reduxImports = `${constants.asyncRedux.importStatement}`
  if (stateImportPath != constants.asyncRedux.importPath) {
    reduxImports += `\nimport '${stateImportPath}';`
  }

  return `import 'package:flutter/material.dart';
${reduxImports}
import '${snakeCaseFeatureName}.dart';

class ${connectorName} extends StatelessWidget {
  @override
  Widget build(BuildContext context) => StoreConnector<${storeConnectorTypeParameters}>(
        vm: () => ${viewModelFactoryName}(),
        builder: (context, viewModel) => ${widgetName}(),
      );
}
`
}
