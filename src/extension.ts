import * as _ from "lodash"

import { commands, ExtensionContext, languages } from "vscode"
import {
  newAsyncReduxClientFeature,
  newAsyncReduxBusinessFeature,
  newAsyncReduxAction,
} from "./commands"
import * as constants from "./constants"
import { SnippetCompletionItemProvider } from "./providers/snippet_completion_item_provider"

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      constants.vscode.dartFileSelector,
      new SnippetCompletionItemProvider(context.extensionPath),
    ),
  )

  context.subscriptions.push(
    commands.registerCommand(
      "extension.new-async-redux-action",
      newAsyncReduxAction,
    ),
    commands.registerCommand(
      "extension.new-async-redux-business-feature",
      newAsyncReduxBusinessFeature,
    ),
    commands.registerCommand(
      "extension.new-async-redux-client-feature",
      newAsyncReduxClientFeature,
    ),
  )
}
