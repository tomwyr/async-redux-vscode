import { window } from "vscode"
import {
  config,
  selectStateImportPathErrors,
  showStatePathMissingInfo,
} from "."

export async function checkStateImportPathSet() {
  const stateImportPath = config.business.state.importPath()
  if (stateImportPath.length == 0) {
    try {
      await showStatePathMissingInfo()

      const stateImportPath = config.business.state.importPath()
      window.showInformationMessage(
        `Successfully updated state import path to: ${stateImportPath}`,
      )
    } catch (error) {
      if (error != selectStateImportPathErrors.pathNotSelected) {
        const message =
          error instanceof Error ? error.message : JSON.stringify(error)

        window.showErrorMessage(`Error: ${message}`)
      }
    }
  }
}
