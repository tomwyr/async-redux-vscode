import * as changeCase from "change-case"
import * as constants from "../constants"

export function getConnectorTemplate(
  featureName: string,
  widgetSuffix: string,
  connectorSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
  stateName: string,
  stateImportPath: string,
): string {
  const pascalCaseFeatureName = changeCase.pascalCase(
    featureName.toLowerCase()
  );

  let connectorName = pascalCaseFeatureName;
  if (connectorIncludeWidgetSuffix) connectorName += widgetSuffix;
  connectorName += `Connector${connectorSuffix}`;

  const widgetName = `${pascalCaseFeatureName}${widgetSuffix}`;
  const viewModelName = `${pascalCaseFeatureName}ViewModel`;
  const viewModelFactoryName = `${pascalCaseFeatureName}ViewModelFactory`;

  const snakeCaseWidgetName = changeCase.snakeCase(widgetName);
  const snakeCaseViewModelName = changeCase.snakeCase(viewModelName);
  const snakeCaseViewModelFactoryName =
    changeCase.snakeCase(viewModelFactoryName);

  const storeConnectorTypeParameters = `${stateName}, ${viewModelName}`;

  let reduxImports = `${constants.asyncRedux.importStatement}`;
  if (
    stateImportPath.length > 0 &&
    stateImportPath != constants.asyncRedux.importPath
  ) {
    reduxImports += `\nimport '${stateImportPath}';`;
  }

  const featureImports = [
    snakeCaseViewModelName,
    snakeCaseViewModelFactoryName,
    snakeCaseWidgetName,
  ]
    .map((item) => `import '${item}.dart';`)
    .join("\n");

  return `import 'package:flutter/material.dart';

${reduxImports}

${featureImports}

class ${connectorName} extends StatelessWidget {
  const ${connectorName}({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => StoreConnector<${storeConnectorTypeParameters}>(
        vm: () => ${viewModelFactoryName}(),
        builder: (context, viewModel) => ${widgetName}(),
      );
}
`
}
