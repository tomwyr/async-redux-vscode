import { workspace } from "vscode"

export function getWorkspacePath(): string | undefined {
  const folders = workspace.workspaceFolders

  if (!folders || folders.length == 0) return

  return folders[0].uri.path
}
