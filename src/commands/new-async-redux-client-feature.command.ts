import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";

import { InputBoxOptions, OpenDialogOptions, Uri, window } from "vscode";
import { existsSync, lstatSync, writeFile } from "fs";
import {
  getClientExportsTemplate,
  getWidgetTemplate,
  getConnectorTemplate,
  getViewModelTemplate,
  getViewModelFactoryTemplate,
} from "../templates";
import { config } from "../utils";

export const newAsyncReduxClientFeature = async (uri: Uri) => {
  const featureName = await promptForFeatureName();
  if (_.isNil(featureName) || featureName.trim() === "") {
    window.showErrorMessage("The feature name must not be empty");
    return;
  }

  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      window.showErrorMessage("Please select a valid directory");
      return;
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());
  try {
    await generateFeatureCode(featureName, targetDirectory);
    window.showInformationMessage(
      `Successfully Generated ${snakeCaseFeatureName} Feature`
    );
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

function promptForFeatureName(): Thenable<string | undefined> {
  const featureNamePromptOptions: InputBoxOptions = {
    prompt: "Feature Name",
    placeHolder: "",
  };
  return window.showInputBox(featureNamePromptOptions);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the feature in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}

async function generateFeatureCode(
  featureName: string,
  targetDirectory: string
) {
  const generateExports = config.client.generateExports();
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());
  const featureDirectoryPath = `${targetDirectory}/${snakeCaseFeatureName}`;

  if (!existsSync(featureDirectoryPath)) {
    await createDirectory(featureDirectoryPath);
  }

  const generatePromises = [
    createWidgetTemplate(featureName, featureDirectoryPath),
    createPageConnectorTemplate(featureName, featureDirectoryPath),
    createViewModelTemplate(featureName, featureDirectoryPath),
    createViewModelFactoryTemplate(featureName, featureDirectoryPath),
  ];

  if (generateExports) {
    generatePromises.push(
      createExportsTemplate(featureName, featureDirectoryPath)
    );
  }

  await Promise.all(generatePromises);
}

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdirp(targetDirectory, (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}

function createExportsTemplate(featureName: string, targetDirectory: string) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());
  const targetFile = `${snakeCaseFeatureName}.dart`;
  const targetPath = `${targetDirectory}/${targetFile}`;

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`);
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getClientExportsTemplate(featureName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

function createWidgetTemplate(featureName: string, targetDirectory: string) {
  const widgetSuffix = config.client.widget.suffix();
  const widgetName = `${featureName}${widgetSuffix}`;
  const snakeCaseWidgetName = changeCase.snakeCase(widgetName.toLowerCase());

  const targetFile = `${snakeCaseWidgetName}.dart`;
  const targetPath = `${targetDirectory}/${targetFile}`;

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`);
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(targetPath, getWidgetTemplate(widgetName), "utf8", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function createPageConnectorTemplate(
  featureName: string,
  targetDirectory: string
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());
  const targetFile = `${snakeCaseFeatureName}_page_connector.dart`;
  const targetPath = `${targetDirectory}/${targetFile}`;

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`);
  }

  const widgetSuffix = config.client.widget.suffix();
  const connectorIncludeWidgetSuffix =
    config.client.connector.includeWidgetSuffix();
  const stateName = config.business.state.name();
  const stateImportPath = config.business.state.importPath();

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getConnectorTemplate(
        featureName,
        widgetSuffix,
        connectorIncludeWidgetSuffix,
        stateName,
        stateImportPath
      ),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

async function createViewModelTemplate(
  featureName: string,
  targetDirectory: string
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());
  const targetFile = `${snakeCaseFeatureName}_view_model.dart`;
  const targetPath = `${targetDirectory}/${targetFile}`;

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`);
  }

  const viewModelBaseName = config.client.viewModel.baseName();
  const viewModelImportPath = config.client.viewModel.importPath();

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getViewModelTemplate(featureName, viewModelBaseName, viewModelImportPath),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

function createViewModelFactoryTemplate(
  featureName: string,
  targetDirectory: string
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName.toLowerCase());
  const targetFile = `${snakeCaseFeatureName}_view_model_factory.dart`;
  const targetPath = `${targetDirectory}/${targetFile}`;

  if (existsSync(targetPath)) {
    throw Error(`${targetFile} already exists`);
  }

  const viewModelFactoryBaseName = config.client.viewModelFactory.baseName();
  const viewModelFactoryImportPath =
    config.client.viewModelFactory.importPath();
  const viewModelFactoryIncludeState =
    config.client.viewModelFactory.includeState();
  const stateName = config.business.state.name();
  const stateImportPath = config.business.state.importPath();

  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getViewModelFactoryTemplate(
        featureName,
        viewModelFactoryBaseName,
        viewModelFactoryImportPath,
        viewModelFactoryIncludeState,
        stateName,
        stateImportPath
      ),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}
