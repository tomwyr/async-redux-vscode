import * as _ from "lodash"
import * as yaml from "js-yaml"
import { workspace, Uri } from "vscode"
import { existsSync } from "fs"
import { getPubspecPath } from "."

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
