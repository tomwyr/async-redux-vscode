import * as _ from "lodash"
import * as changeCase from "change-case"
import * as mkdirp from "mkdirp"

import { InputBoxOptions, OpenDialogOptions, Uri, window } from "vscode"
import { existsSync, lstatSync, writeFile } from "fs"
import {
  getDefaultStateTemplate,
  getBusinessExportsTemplate,
  getFreezedStateTemplate,
} from "../templates"
import { config } from "../utils"

export const newAsyncReduxBusinessFeature = async (uri: Uri) => {
  const featureName = await promptForFeatureName()
  if (_.isNil(featureName) || featureName.trim() === "") {
    window.showErrorMessage("The feature name must not be empty")
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

  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  try {
    await generateFeatureCode(featureName, targetDirectory)
    window.showInformationMessage(
      `Successfully generated ${snakeCaseFeatureName} business feature`,
    )
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    )
  }
}

function promptForFeatureName(): Thenable<string | undefined> {
  const featureNamePromptOptions: InputBoxOptions = {
    prompt: "Feature Name",
    placeHolder: "",
  }
  return window.showInputBox(featureNamePromptOptions)
}

async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the feature in",
    canSelectFolders: true,
  }

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined
    }
    return uri[0].fsPath
  })
}

async function generateFeatureCode(
  featureName: string,
  targetDirectory: string,
) {
  const generateExports = config.business.generateExports()
  const useFullFeatureNames = config.general.useFullFeatureNames()

  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  const featureDirectoryPath = `${targetDirectory}/${snakeCaseFeatureName}`
  const featureActionsDirectoryPath = `${featureDirectoryPath}/actions`
  const featureModelsDirectoryPath = `${featureDirectoryPath}/models`

  if (!existsSync(featureDirectoryPath)) {
    await createDirectory(featureDirectoryPath)
  }
  if (!existsSync(featureActionsDirectoryPath)) {
    await createDirectory(featureActionsDirectoryPath)
  }
  if (!existsSync(featureModelsDirectoryPath)) {
    await createDirectory(featureModelsDirectoryPath)
  }

  const generatePromises: Promise<void>[] = [
    createStateTemplate(
      featureName,
      featureModelsDirectoryPath,
      useFullFeatureNames,
    ),
  ]

  if (generateExports) {
    generatePromises.push(
      createExportsTemplate(
        featureName,
        featureDirectoryPath,
        useFullFeatureNames,
      ),
    )
  }

  await Promise.all(generatePromises)
}

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdirp(targetDirectory, (error) => {
      if (error) {
        return reject(error)
      }
      resolve()
    })
  })
}

function createStateTemplate(
  featureName: string,
  targetDirectory: string,
  useFullFeatureNames: boolean,
) {
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()

  let targetFile = ""
  if (useFullFeatureNames) targetFile += `${snakeCaseFeatureName}_`
  targetFile += "state.dart"

  const targetPath = `${targetDirectory}/${targetFile}`

  const generateFreezed = config.business.state.generateFreezed()

  const getStateTemplate = generateFreezed
    ? getFreezedStateTemplate
    : getDefaultStateTemplate

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getStateTemplate(featureName, useFullFeatureNames),
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

function createExportsTemplate(
  featureName: string,
  targetDirectory: string,
  useFullFeatureNames: boolean,
) {
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  const targetFile = `${snakeCaseFeatureName}.dart`
  const targetPath = `${targetDirectory}/${targetFile}`

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getBusinessExportsTemplate(featureName, useFullFeatureNames),
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
