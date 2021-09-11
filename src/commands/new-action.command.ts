import * as changeCase from "change-case"
import { existsSync, lstatSync, writeFile } from "fs"
import * as _ from "lodash"
import { join } from "path"
import { InputBoxOptions, OpenDialogOptions, Uri, window } from "vscode"
import * as constants from "../constants"
import { getActionTemplate } from "../templates"
import {
  ActionType,
  asyncPickItem,
  checkStateImportPathSet,
  config,
  getLastIndexWhere,
  readFileData,
  showActionTypePicker,
  syncPickItem,
  writeFileData,
} from "../utils"

export const newAsyncReduxAction = async (uri: Uri) => {
  const actionName = await promptForActionName()
  if (_.isNil(actionName) || actionName.trim() === "") {
    window.showErrorMessage("The action name must not be empty")
    return
  }

  const actionType = await promptForActionType()
  if (_.isNil(actionType) || actionName.trim() === "") {
    window.showErrorMessage("The action type must be selected")
    return
  }

  let targetDirectory
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory()
    if (_.isNil(targetDirectory)) {
      window.showErrorMessage("Please select a valid directory")
      return
    }
  } else {
    targetDirectory = uri.fsPath
  }

  const snakeCaseActionName = changeCase.snake(actionName).toLowerCase()
  try {
    await generateActionCode(actionName, actionType, targetDirectory)
    window.showInformationMessage(
      `Successfully Generated ${snakeCaseActionName} action`,
    )
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    )
  }

  await checkStateImportPathSet()
}

function promptForActionName(): Thenable<string | undefined> {
  const actionNamePromptOptions: InputBoxOptions = {
    prompt: "Action Name",
    placeHolder: "",
  }
  return window.showInputBox(actionNamePromptOptions)
}

async function promptForActionType(): Promise<ActionType | undefined> {
  const item = await showActionTypePicker()

  if (item == syncPickItem) return ActionType.sync
  if (item == asyncPickItem) return ActionType.async
}

async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select new action folder",
    canSelectFolders: true,
  }

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined
    }
    return uri[0].fsPath
  })
}

async function generateActionCode(
  actionName: string,
  actionType: ActionType,
  targetDirectory: string,
): Promise<void> {
  const actionsDirectoryPath = getActionsDirectoryPath(targetDirectory)

  await createActionTemplate(actionName, actionType, actionsDirectoryPath)

  const addToExports = config.business.action.addToExports()
  if (addToExports) {
    addActionToFeatureExports(actionName, actionsDirectoryPath)
  }
}

function getActionsDirectoryPath(targetDirectory: string): string {
  const actionsDirectoryName = constants.asyncRedux.actionsDirectory
  const actionsDirectoryPath = join(targetDirectory, actionsDirectoryName)

  return existsSync(actionsDirectoryPath)
    ? actionsDirectoryPath
    : targetDirectory
}

async function createActionTemplate(
  actionName: string,
  actionType: ActionType,
  targetDirectory: string,
) {
  const snakeCaseActionName = changeCase.snake(actionName).toLowerCase()
  const targetFile = `${snakeCaseActionName}_action.dart`
  const targetPath = join(targetDirectory, targetFile)

  const stateName = config.business.state.name()
  const stateImportPath = config.business.state.importPath()
  const actionIncludeState = config.business.action.includeState()
  const actionImportPath = config.business.action.importPath()

  let actionBaseName = config.business.action.baseName()
  if (actionIncludeState) actionBaseName += `<${stateName}>`

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getActionTemplate(
        actionName,
        actionBaseName,
        actionImportPath,
        actionType,
        stateName,
        stateImportPath,
      ),
      "utf8",
      (error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      },
    )
  })
}

async function addActionToFeatureExports(
  actionName: string,
  actionsDirectoryPath: string,
) {
  const featurePathItems = actionsDirectoryPath.split("/").slice(0, -1)
  const featurePath = featurePathItems.join("/")
  const featureName = featurePathItems[featurePathItems.length - 1]
  const featureFileName = `${featureName}.dart`
  const featureExportsPath = join(featurePath, featureFileName)

  if (!existsSync(featureExportsPath)) return

  const snakeCaseActionName = changeCase.snake(actionName).toLowerCase()
  const actionExportStatement = `export 'actions/${snakeCaseActionName}_action.dart';`

  addActionToFeatureExportsFile(featureExportsPath, actionExportStatement)
}

async function addActionToFeatureExportsFile(
  featureExportsPath: string,
  actionExportStatement: string,
) {
  const file = await readFileData(featureExportsPath)
  const rows = file.toString().split("\n")

  const preceedingActionExportIndex = getLastIndexWhere(
    rows,
    (item) => item.startsWith("export") && item < actionExportStatement,
  )
  rows.splice(preceedingActionExportIndex + 1, 0, actionExportStatement)

  await writeFileData(featureExportsPath, rows.join("\n"))
}
