import * as changeCase from "change-case"
import { join } from "path"
import * as constants from "../constants"
import { convertToAbsoluteImportPath } from "../utils"

export async function getConnectorTemplate(
  featureName: string,
  targetDirectory: string,
  widgetSuffix: string,
  injectViewModel: boolean,
  connectorSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
  stateName: string,
  stateImportPath: string,
  useFullFeatureNames: boolean,
  useAbsoluteImports: boolean,
): Promise<string> {
  const snakeCaseFeatureName = changeCase.snake(featureName)
  const pascalCaseFeatureName = changeCase.pascal(featureName)

  let connectorName = pascalCaseFeatureName
  if (connectorIncludeWidgetSuffix) connectorName += widgetSuffix
  connectorName += `Connector${connectorSuffix}`

  const widgetName = `${pascalCaseFeatureName}${widgetSuffix}`
  const widgetArguments = injectViewModel ? "viewModel: viewModel" : ""

  const viewModelName = `${pascalCaseFeatureName}ViewModel`
  const viewModelFactoryName = `${pascalCaseFeatureName}ViewModelFactory`

  const snakeCaseWidgetName = changeCase.snake(widgetName)
  const snakeCaseViewModelName = changeCase.snake(viewModelName)
  const snakeCaseViewModelFactoryName = changeCase.snake(viewModelFactoryName)

  const storeConnectorTypeParameters = `${stateName}, ${viewModelName}`

  let reduxImports = `${constants.asyncRedux.importStatement}`
  if (
    stateImportPath.length > 0 &&
    stateImportPath != constants.asyncRedux.importPath
  ) {
    reduxImports += `\nimport '${stateImportPath}';`
  }

  const featurePrefixLength = `${snakeCaseFeatureName}_`.length

  const importPathPromises = [
    snakeCaseViewModelName,
    snakeCaseViewModelFactoryName,
    snakeCaseWidgetName,
  ].map(async (item) => {
    let importPath = `${item}.dart`

    if (!useFullFeatureNames) {
      importPath = importPath.slice(featurePrefixLength)
    }

    if (useAbsoluteImports) {
      const absoluteFilePath = join(targetDirectory, importPath)
      importPath = await convertToAbsoluteImportPath(absoluteFilePath)
    }

    return `import '${importPath}';`
  })

  const importPaths = await Promise.all(importPathPromises)
  const featureImports = importPaths.join("\n")

  return `import 'package:flutter/material.dart';
${reduxImports}

${featureImports}

class ${connectorName} extends StatelessWidget {
  const ${connectorName}({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => StoreConnector<${storeConnectorTypeParameters}>(
        vm: () => ${viewModelFactoryName}(),
        builder: (context, viewModel) => ${widgetName}(${widgetArguments}),
      );
}
`
}
