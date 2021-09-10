import { commands, ConfigurationTarget, workspace } from "vscode"
import * as constants from "../constants"

export const config = {
  general: {
    enableSnippets: getEnableSnippets,
    useFullFeatureNames: getUseFullFeatureNames,
  },
  business: {
    generateExports: getBusinessGenerateExports,
    state: {
      name: getStateName,
      importPath: getStateImportPath,
      generateFreezed: getStateGenerateFreezed,
    },
    action: {
      baseName: getActionBaseName,
      importPath: getActionImportPath,
      includeState: getActionIncludeState,
      addToExports: getActionAddToExports,
    },
  },
  client: {
    generateExports: getClientGenerateExports,
    injectViewModel: getInjectViewModel,
    widget: {
      suffix: getWidgetSuffix,
    },
    connector: {
      suffix: getConnectorSuffix,
      includeWidgetSuffix: getConnectorIncludeWidgetSuffix,
    },
    viewModel: {
      baseName: getViewModelBaseName,
      importPath: getViewModelImportPath,
    },
    viewModelFactory: {
      baseName: getViewModelFactoryBaseName,
      importPath: getViewModelFactoryImportPath,
      includeState: getViewModelFactoryIncludeState,
    },
  },
}

export const changeConfig = {
  stateImportPath: setStateImportPath,
}

export const openConfig = {
  stateImportPath: openStateImportPath,
}

function getEnableSnippets(): boolean {
  return getConfigValue("general.enableSnippets") ?? true
}

function getUseFullFeatureNames(): boolean {
  return getConfigValue("general.useFullFeatureNames") ?? true
}

function getBusinessGenerateExports(): boolean {
  return getConfigValue("business.generateExports") ?? true
}

function getStateGenerateFreezed(): boolean {
  return getConfigValue("business.state.generateFreezed") ?? false
}

function getStateName(): string {
  return getConfigValue("business.state.name") ?? constants.asyncRedux.stateName
}

function getStateImportPath(): string {
  return getConfigValue("business.state.importPath") ?? ""
}

function getActionBaseName(): string {
  return (
    getConfigValue("business.action.baseName") ??
    constants.asyncRedux.actionBaseName
  )
}

function getActionImportPath(): string {
  return (
    getConfigValue("business.action.importPath") ??
    constants.asyncRedux.importPath
  )
}

function getActionIncludeState(): boolean {
  return getConfigValue("business.action.includeState") ?? true
}

function getActionAddToExports(): boolean {
  return getConfigValue("business.action.addToExports") ?? true
}

function getClientGenerateExports(): boolean {
  return getConfigValue("client.generateExports") ?? true
}

function getInjectViewModel(): boolean {
  return getConfigValue("client.injectViewModel") ?? false
}

function getWidgetSuffix(): string {
  return (
    getConfigValue("client.widget.suffix") ?? constants.asyncRedux.widgetSuffix
  )
}

function getConnectorSuffix(): string {
  return (
    getConfigValue("client.connector.suffix") ??
    constants.asyncRedux.connectorSuffix
  )
}

function getViewModelBaseName(): string {
  return (
    getConfigValue("client.viewModel.baseName") ??
    constants.asyncRedux.viewModelBaseName
  )
}

function getViewModelImportPath(): string {
  return (
    getConfigValue("client.viewModel.importPath") ??
    constants.asyncRedux.importPath
  )
}

function getViewModelFactoryBaseName(): string {
  return (
    getConfigValue("client.viewModelFactory.baseName") ??
    constants.asyncRedux.viewModelFactoryBaseName
  )
}

function getViewModelFactoryImportPath(): string {
  return (
    getConfigValue("client.viewModelFactory.importPath") ??
    constants.asyncRedux.importPath
  )
}

function getViewModelFactoryIncludeState(): boolean {
  return getConfigValue("client.viewModelFactory.includeState") ?? true
}

function getConnectorIncludeWidgetSuffix(): boolean {
  return getConfigValue("client.connector.includeWidgetSuffix") ?? false
}

function getConfigValue<T>(configItemName: string): T | undefined {
  return workspace
    .getConfiguration(constants.extension.configId)
    .get(configItemName)
}

async function setStateImportPath(importPath: string) {
  await workspace
    .getConfiguration(constants.extension.configId)
    .update(
      "business.state.importPath",
      importPath,
      ConfigurationTarget.Workspace,
    )
}

async function openStateImportPath() {
  const settingPath = `${constants.extension.configId}.business.state.importPath`

  await commands.executeCommand(
    // TODO switch to workspace settings once it gets supported by vscode
    // "workbench.action.openWorkspaceSettings",
    // https://github.com/microsoft/vscode/issues/90086
    "workbench.action.openSettings",
    settingPath,
  )
}
