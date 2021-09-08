import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  Position,
  ProviderResult,
  SnippetString,
  TextDocument,
} from "vscode"
import { config } from "../utils"
import * as fs from "fs"
import * as path from "path"

export class SnippetCompletionItemProvider implements CompletionItemProvider {
  private snippetFileNames = ["business.json", "client.json"]

  private extensionPath: string

  private snippetItems: CompletionItem[]

  constructor(extensionPath: string) {
    this.extensionPath = extensionPath

    this.snippetItems = this.snippetFileNames
      .map((fileName) => this.createSnippetFileItems(fileName))
      .reduce((allItems, fileItems) => allItems.concat(fileItems), [])
  }

  provideCompletionItems(
    _document: TextDocument,
    _position: Position,
    _token: CancellationToken,
    _context: CompletionContext,
  ): ProviderResult<CompletionItem[]> {
    const general = config.general
    console.log(general)
    if (!config.general.enableSnippets()) return

    return this.snippetItems
  }

  private createSnippetFileItems(fileName: string): Array<CompletionItem> {
    const filePath = `snippets/${fileName}`
    const environmentFilePath = path.join(this.extensionPath, filePath)
    const snippets = JSON.parse(fs.readFileSync(environmentFilePath).toString())

    return Object.entries<any>(snippets).map((entry) =>
      this.createSnippetItem(entry),
    )
  }

  // { [key: K]: V } stands for object entry type
  private createSnippetItem(entry: [string, any]): CompletionItem {
    const [name, config] = entry

    const bodyString = Array.isArray(config.body)
      ? config.body.join("\n")
      : config.body.toString()

    const completionItem = new CompletionItem(name, CompletionItemKind.Snippet)

    completionItem.filterText = config.prefix
    completionItem.detail = config.description
    completionItem.insertText = new SnippetString(bodyString)
    completionItem.documentation = new MarkdownString().appendCodeblock(
      bodyString,
    )
    // Put snippets at the bottom of completion items list before any text is typed in.
    completionItem.sortText = "ZZZ"

    return completionItem
  }
}
