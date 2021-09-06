import * as changeCase from "change-case";
import * as constants from "../constants";

export function getViewModelFactoryTemplate(
  featureName: string,
  viewModelFactoryBaseName: string,
  viewModelFactoryImportPath: string,
  viewModelFactoryIncludeState: boolean,
  stateName: string,
  stateImportPath: string
): string {
  const pascalCaseFeatureName = changeCase.pascalCase(
    featureName.toLowerCase()
  );
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());

  const viewModelFactoryName = `${pascalCaseFeatureName}ViewModelFactory`;
  const viewModelName = `${pascalCaseFeatureName}ViewModel`;
  const connectorName = `${pascalCaseFeatureName}Connector`;

  const viewModelFactoryTypeParameters = [
    ...(viewModelFactoryIncludeState ? [stateName] : []),
    connectorName,
  ].join(`, `);

  let reduxImports = `${constants.asyncRedux.importStatement}`;
  if (viewModelFactoryImportPath != constants.asyncRedux.importPath) {
    reduxImports += `\nimport '${viewModelFactoryImportPath}';`;
  }
  if (
    viewModelFactoryIncludeState &&
    stateImportPath != constants.asyncRedux.importPath
  ) {
    reduxImports += `\nimport '${stateImportPath}';`;
  }

  return `${reduxImports}
import '${snakeCaseFeatureName}.dart';
  
class ${viewModelFactoryName} extends ${viewModelFactoryBaseName}<${viewModelFactoryTypeParameters}> {
  @override
  Vm fromStore() => ${viewModelName}();
}
`;
}
