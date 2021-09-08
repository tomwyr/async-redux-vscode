import { QuickPickItem, window } from "vscode"

export async function showActionTypePicker(): Promise<
  ActionTypePickItem | undefined
> {
  return new Promise((resolve) => {
    let selection: ActionTypePickItem | undefined

    const input = window.createQuickPick<ActionTypePickItem>()

    input.placeholder = "Action Type"
    input.items = [syncPickItem, asyncPickItem]

    input.onDidChangeSelection((items) => {
      selection = items.length > 0 ? items[0] : undefined
    })

    input.onDidAccept(() => {
      input.hide()
      resolve(selection)
    })

    input.show()
  })
}

export interface ActionTypePickItem extends QuickPickItem {}

export const syncPickItem: ActionTypePickItem = {
  label: "sync",
  description: "Produces new state synchronously",
}

export const asyncPickItem: ActionTypePickItem = {
  label: "async",
  description: "Produces new state asynchronously",
}
