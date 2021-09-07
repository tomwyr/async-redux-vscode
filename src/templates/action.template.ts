import * as changeCase from "change-case";
import { ActionType } from "../utils";

export function getActionTemplate(
  actionName: string,
  actionBaseName: string,
  actionImport: string,
  actionType: ActionType,
  stateName: string,
  stateImport: string
): string {
  const pascalCaseActionName = changeCase.pascal(actionName.toLowerCase());
  const reduxActionName = `${pascalCaseActionName}Action`;
  const actionReduce = getActionTypeReduce(actionType, stateName);

  const imports = Array.from(new Set([actionImport, stateImport])).join("\n");

  return `${imports}

class ${reduxActionName} extends ${actionBaseName} {
  ${actionReduce}
}
`;
}

function getActionTypeReduce(
  actionType: ActionType,
  stateName: string
): string {
  switch (actionType) {
    case ActionType.sync:
      return getSyncReduce(stateName);
    case ActionType.async:
      return getAsyncReduce(stateName);
  }
}

function getSyncReduce(stateName: string): string {
  return `@override
  ${stateName}? reduce() {
    
  }`;
}

function getAsyncReduce(stateName: string): string {
  return `@override
  Future<${stateName}?> reduce() async {
    
  }`;
}
