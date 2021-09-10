import * as changeCase from "change-case"
import { join } from "path"
import * as constants from "../constants"
import { convertToAbsoluteImportPath } from "../utils"

export async function getViewModelFactoryTemplate(
  featureName: string,
  targetDirectory: string,
  widgetSuffix: string,
  connectorSuffix: string,
  connectorIncludeWidgetSuffix: boolean,
  viewModelFactoryBaseName: string,
  viewModelFactoryImportPath: string,
  viewModelFactoryIncludeState: boolean,
  stateName: string,
  stateImportPath: string,
  useFullFeatureNames: boolean,
  useAbsoluteImports: boolean,
): Promise<string> {
  const snakeCaseFeatureName = changeCase.snake(featureName)
  const pascalCaseFeatureName = changeCase.pascal(featureName)

  let connectorName = `${pascalCaseFeatureName}`
  if (connectorIncludeWidgetSuffix) {
    connectorName += widgetSuffix
  }
  connectorName += `Connector${connectorSuffix}`

  const viewModelName = `${pascalCaseFeatureName}ViewModel`
  const viewModelFactoryName = `${pascalCaseFeatureName}ViewModelFactory`

  const snakeCaseConnectorName = changeCase.snake(connectorName)
  const snakeCaseViewModelName = changeCase.snake(viewModelName)

  const viewModelFactoryTypeParameters = [
    ...(viewModelFactoryIncludeState ? [stateName] : []),
    connectorName,
  ].join(`, `)

  let reduxImports = `${constants.asyncRedux.importStatement}`
  if (viewModelFactoryImportPath != constants.asyncRedux.importPath) {
    reduxImports += `\nimport '${viewModelFactoryImportPath}';`
  }

  const includeCustomStateImport =
    viewModelFactoryIncludeState &&
    stateImportPath.length > 0 &&
    stateImportPath != constants.asyncRedux.importPath

  if (includeCustomStateImport) {
    reduxImports += `\nimport '${stateImportPath}';`
  }

  const featurePrefixLength = `${snakeCaseFeatureName}_`.length

  const importPathPromises = [
    snakeCaseConnectorName,
    snakeCaseViewModelName,
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

  return `${reduxImports}

${featureImports}
  
class ${viewModelFactoryName} extends ${viewModelFactoryBaseName}<${viewModelFactoryTypeParameters}> {
  @override
  Vm fromStore() => ${viewModelName}();
}
`
}
