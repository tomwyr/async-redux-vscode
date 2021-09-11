import { Uri, window } from "vscode"
import { getProjectName, getWorkspacePath } from "."
import { join } from "path"
import { existsSync } from "fs"

export async function selectStateImportPath(): Promise<string> {
  const projectPath = getWorkspacePath()
  if (!projectPath || !existsSync(join(projectPath, "pubspec.yaml"))) {
    throw selectStateImportPathErrors.notProjectWorkspace
  }

  const projectLibPath = join(projectPath, "lib")
  const stateFilePath = await showStateFilePathDialog(projectLibPath)
  if (!stateFilePath) {
    throw selectStateImportPathErrors.pathNotSelected
  }
  if (!stateFilePath.startsWith(projectLibPath)) {
    throw selectStateImportPathErrors.selectionNotInProject
  }

  const stateImportPath = await getStateImportPath(
    projectLibPath,
    stateFilePath,
  )
  if (!stateImportPath) {
    throw selectStateImportPathErrors.unknownProjectName
  }

  return stateImportPath
}

export const selectStateImportPathErrors = {
  notProjectWorkspace: new Error(
    "Current workspace is not a valid Dart project",
  ),
  pathNotSelected: new Error("State file selecetion was cancelled"),
  selectionNotInProject: new Error(
    "Selected file path is outside of current project workspace",
  ),
  unknownProjectName: new Error(
    "Project pubspec.yaml file does not contain valid `name` entry",
  ),
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

async function getStateImportPath(
  projectLibPath: string,
  stateFilePath: string,
): Promise<string | undefined> {
  const libPathLength = projectLibPath.length + 1
  const libStateFilePath = stateFilePath.slice(libPathLength)

  const projectName = await getProjectName()

  if (!projectName || projectName.length == 0) return

  return `package:${projectName}/${libStateFilePath}`
}
