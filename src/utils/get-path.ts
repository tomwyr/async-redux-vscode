import { existsSync } from "fs"
import { join } from "path"
import { workspace } from "vscode"

export function getProjectPath(): string | undefined {
  const projectPath = getWorkspacePath()
  const pubspecPath = getPubspecPath()

  if (!projectPath || !pubspecPath || !existsSync(pubspecPath)) return

  return projectPath
}

export function getWorkspacePath(): string | undefined {
  const folders = workspace.workspaceFolders

  if (!folders || folders.length == 0) return

  return folders[0].uri.path
}

export function getPubspecPath(): string | undefined {
  const workspacePath = getWorkspacePath()

  if (!workspacePath) return

  return join(workspacePath, "pubspec.yaml")
}
