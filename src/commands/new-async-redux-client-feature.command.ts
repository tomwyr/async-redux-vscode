import * as _ from "lodash"
import * as changeCase from "change-case"
import * as mkdirp from "mkdirp"

import { InputBoxOptions, OpenDialogOptions, Uri, window } from "vscode"
import { existsSync, lstatSync, writeFile } from "fs"
import {
  getClientExportsTemplate,
  getWidgetTemplate,
  getConnectorTemplate,
  getViewModelTemplate,
  getViewModelFactoryTemplate,
} from "../templates"
import { checkStateImportPathSet, config } from "../utils"

export const newAsyncReduxClientFeature = async (uri: Uri) => {
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
      `Successfully generated ${snakeCaseFeatureName} client feature`,
    )
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    )
  }

  await checkStateImportPathSet()
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
  const generateExports = config.client.generateExports()
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  const featureDirectoryPath = `${targetDirectory}/${snakeCaseFeatureName}`

  if (!existsSync(featureDirectoryPath)) {
    await createDirectory(featureDirectoryPath)
  }

  const generatePromises = [
    createWidgetTemplate(featureName, featureDirectoryPath),
    createConnectorTemplate(featureName, featureDirectoryPath),
    createViewModelTemplate(featureName, featureDirectoryPath),
    createViewModelFactoryTemplate(featureName, featureDirectoryPath),
  ]

  if (generateExports) {
    generatePromises.push(
      createExportsTemplate(featureName, featureDirectoryPath),
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

function createExportsTemplate(featureName: string, targetDirectory: string) {
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()
  const targetFile = `${snakeCaseFeatureName}.dart`
  const targetPath = `${targetDirectory}/${targetFile}`

  const widgetSuffix = config.client.widget.suffix()
  const connectorSuffix = config.client.connector.suffix()
  const connectorIncludeWidgetSuffix =
    config.client.connector.includeWidgetSuffix()
  const useFullFeatureNames = config.general.useFullFeatureNames()

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getClientExportsTemplate(
        featureName,
        widgetSuffix,
        connectorSuffix,
        connectorIncludeWidgetSuffix,
        useFullFeatureNames,
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

function createWidgetTemplate(featureName: string, targetDirectory: string) {
  const snakeCaseFeatureName = changeCase.snake(featureName)
  const pascalCaseFeatureName = changeCase.pascal(featureName)
  const widgetSuffix = config.client.widget.suffix()
  const snakeCaseWidgetSuffix = changeCase.snake(widgetSuffix)
  const widgetName = `${pascalCaseFeatureName}${widgetSuffix}`

  const viewModelName = `${pascalCaseFeatureName}ViewModel`
  const injectViewModel = config.client.injectViewModel()

  const useFullFeatureNames = config.general.useFullFeatureNames()

  let viewModelFileName = ""
  if (useFullFeatureNames) viewModelFileName += `${snakeCaseFeatureName}_`
  viewModelFileName += "view_model"

  let targetFile = ""
  if (useFullFeatureNames) targetFile += `${snakeCaseFeatureName}_`
  targetFile += `${snakeCaseWidgetSuffix}.dart`

  const targetPath = `${targetDirectory}/${targetFile}`

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getWidgetTemplate(
        widgetName,
        viewModelName,
        viewModelFileName,
        injectViewModel,
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

function createConnectorTemplate(featureName: string, targetDirectory: string) {
  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()

  const widgetSuffix = config.client.widget.suffix()
  const snakeCaseWidgetSuffix = changeCase.snake(widgetSuffix).toLowerCase()

  const injectViewModel = config.client.injectViewModel()

  const connectorSuffix = config.client.connector.suffix()
  const snakeCaseConnectorSuffix = changeCase
    .snake(connectorSuffix)
    .toLowerCase()

  const connectorIncludeWidgetSuffix =
    config.client.connector.includeWidgetSuffix()

  const stateName = config.business.state.name()
  const stateImportPath = config.business.state.importPath()

  const useFullFeatureNames = config.general.useFullFeatureNames()

  let targetFile = ""
  if (useFullFeatureNames) targetFile += `${snakeCaseFeatureName}_`
  if (connectorIncludeWidgetSuffix) {
    targetFile += `${snakeCaseWidgetSuffix}_`
  }
  targetFile += "connector"
  if (snakeCaseConnectorSuffix.length > 0) {
    targetFile += `_${snakeCaseConnectorSuffix}`
  }
  targetFile += ".dart"

  const targetPath = `${targetDirectory}/${targetFile}`

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getConnectorTemplate(
        featureName,
        widgetSuffix,
        injectViewModel,
        connectorSuffix,
        connectorIncludeWidgetSuffix,
        stateName,
        stateImportPath,
        useFullFeatureNames,
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

async function createViewModelTemplate(
  featureName: string,
  targetDirectory: string,
) {
  const useFullFeatureNames = config.general.useFullFeatureNames()

  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()

  let targetFile = ""
  if (useFullFeatureNames) targetFile += `${snakeCaseFeatureName}_`
  targetFile += "view_model.dart"

  const targetPath = `${targetDirectory}/${targetFile}`

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  const viewModelBaseName = config.client.viewModel.baseName()
  const viewModelImportPath = config.client.viewModel.importPath()

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getViewModelTemplate(featureName, viewModelBaseName, viewModelImportPath),
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

function createViewModelFactoryTemplate(
  featureName: string,
  targetDirectory: string,
) {
  const useFullFeatureNames = config.general.useFullFeatureNames()

  const snakeCaseFeatureName = changeCase.snake(featureName).toLowerCase()

  let targetFile = ""
  if (useFullFeatureNames) targetFile += `${snakeCaseFeatureName}_`
  targetFile += "view_model_factory.dart"

  const targetPath = `${targetDirectory}/${targetFile}`

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`)
  }

  const widgetSuffix = config.client.widget.suffix()
  const connectorSuffix = config.client.connector.suffix()
  const connectorIncludeWidgetSuffix =
    config.client.connector.includeWidgetSuffix()
  const viewModelFactoryBaseName = config.client.viewModelFactory.baseName()
  const viewModelFactoryImportPath = config.client.viewModelFactory.importPath()
  const viewModelFactoryIncludeState =
    config.client.viewModelFactory.includeState()
  const stateName = config.business.state.name()
  const stateImportPath = config.business.state.importPath()

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getViewModelFactoryTemplate(
        featureName,
        widgetSuffix,
        connectorSuffix,
        connectorIncludeWidgetSuffix,
        viewModelFactoryBaseName,
        viewModelFactoryImportPath,
        viewModelFactoryIncludeState,
        stateName,
        stateImportPath,
        useFullFeatureNames,
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
