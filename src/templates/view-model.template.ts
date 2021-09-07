import * as changeCase from "change-case";

export function getViewModelTemplate(
  featureName: string,
  viewModelBaseName: string,
  viewModelImportPath: string
): string {
  const pascalCaseFeatureName = changeCase.pascalCase(
    featureName.toLowerCase()
  );
  const viewModelName = `${pascalCaseFeatureName}ViewModel`;

  return `import '${viewModelImportPath}';

class ${viewModelName} extends ${viewModelBaseName} {
  ${viewModelName}() : super(equals: []);
}
`;
}
