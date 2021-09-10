import * as _ from "lodash"
import * as yaml from "js-yaml"
import { workspace, Uri } from "vscode"
import * as path from "path"
import { getWorkspacePath } from "."
import { existsSync } from "fs"

export async function getProjectName(): Promise<string | undefined> {
  const pubspec = await getPubspec()

  if (!pubspec) return

  const projectName = pubspec["name"]

  if (typeof projectName !== "string") return

  return projectName
}

async function getPubspec(): Promise<Record<string, any> | undefined> {
  const pubspecPath = getPubspecPath()

  if (!pubspecPath || !existsSync(pubspecPath)) return

  let pubspecBytes = await workspace.fs.readFile(Uri.file(pubspecPath))

  try {
    return yaml.load(pubspecBytes.toString()) as Record<string, any>
  } catch (_) {}
}

function getPubspecPath(): string | undefined {
  const workspacePath = getWorkspacePath()

  if (!workspacePath) return

  return path.join(workspacePath, "pubspec.yaml")
}
