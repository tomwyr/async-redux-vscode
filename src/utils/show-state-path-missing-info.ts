import { MessageItem, window } from "vscode"
import { changeConfig, openConfig, selectStateImportPath } from "."

export async function showStatePathMissingInfo() {
  const selectedItem = await getSetStateImportPathItem()

  switch (selectedItem) {
    case openSettings:
      await openConfig.stateImportPath()
      break

    case selectFile:
      await selectStateImportPath().then(changeConfig.stateImportPath)
      break
  }
}

async function getSetStateImportPathItem(): Promise<
  SetStateImportPathItem | undefined
> {
  const message =
    "State import path has not yet been set in extension settings. " +
    "You can select state file or provide path in settings to make " +
    "the extension include state import statement in generated code."

  const items = [openSettings, selectFile]

  return await window.showInformationMessage<SetStateImportPathItem>(
    message,
    ...items,
  )
}

interface SetStateImportPathItem extends MessageItem {}

const openSettings: SetStateImportPathItem = {
  title: "Open settings",
}

const selectFile: SetStateImportPathItem = {
  title: "Select file",
}
