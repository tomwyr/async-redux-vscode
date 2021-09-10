import { Uri, window } from "vscode"
import { convertToAbsoluteImportPath, errors, getProjectPath } from "."
import { join } from "path"

export async function selectStateImportPath(): Promise<string> {
  const projectPath = getProjectPath()

  if (!projectPath) throw errors.notProjectWorkspace

  const projectLibPath = join(projectPath, "lib")
  const stateFilePath = await showStateFilePathDialog(projectLibPath)

  if (!stateFilePath) throw errors.pathNotSelected
  if (!stateFilePath.startsWith(projectLibPath)) {
    throw errors.selectionNotInProject
  }

  return convertToAbsoluteImportPath(stateFilePath)
}

async function showStateFilePathDialog(
  projectLibPath: string,
): Promise<string | undefined> {
  const selectedUris = await window.showOpenDialog({
    canSelectMany: false,
    openLabel: "Select state file",
    defaultUri: Uri.parse(projectLibPath),
    filters: { Dart: ["dart"] },
  })

  if (selectedUris == undefined || selectedUris.length == 0) return

  return selectedUris[0].path
}
