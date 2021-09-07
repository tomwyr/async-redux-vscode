import * as changeCase from "change-case";

export function getDefaultStateTemplate(featureName: string): string {
  const pascalCaseFeatureName = changeCase.pascal(featureName.toLowerCase());
  const featureStateName = `${pascalCaseFeatureName}State`;

  return `class ${featureStateName} {
    ${featureStateName}();

    ${featureStateName} copyWith() => ${featureStateName}();
}
`;
}
