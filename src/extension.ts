import * as _ from "lodash"

import { commands, ExtensionContext, languages } from "vscode"
import {
  newAsyncReduxClientFeature,
  newAsyncReduxBusinessFeature,
  newAsyncReduxAction,
} from "./commands"
import * as constants from "./constants"
import {
  newAsyncReduxActionCommand,
  newAsyncReduxBusinessFeatureCommand,
  newAsyncReduxClientFeatureCommand,
} from "./constants/extension"
import { SnippetCompletionItemProvider } from "./providers/snippet_completion_item_provider"

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      constants.vscode.dartFileSelector,
      new SnippetCompletionItemProvider(context.extensionPath),
    ),
  )

  context.subscriptions.push(
    commands.registerCommand(newAsyncReduxActionCommand, newAsyncReduxAction),
    commands.registerCommand(
      newAsyncReduxBusinessFeatureCommand,
      newAsyncReduxBusinessFeature,
    ),
    commands.registerCommand(
      newAsyncReduxClientFeatureCommand,
      newAsyncReduxClientFeature,
    ),
  )
}
