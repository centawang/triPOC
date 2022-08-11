import * as path from 'path'
import * as vscode from 'vscode'
import { ContentProvider } from './ContentProvider'

export class TridentProvider implements vscode.TreeDataProvider<TridentNode> {
  constructor() { }

  getTreeItem(element: TridentNode): vscode.TreeItem {
    return element
  }

  getChildren(element?: TridentNode): Thenable<TridentNode[]> {
    if (element) {
      return Promise.resolve(
        [],
      )
    }
    else {
      return Promise.resolve(ContentProvider.getWorkspaceAsTridentNode())
    }
  }
}

export class TridentNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly type: string,
    private objStr: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState)
    this.tooltip = `${this.label}-${this.id}`
    this.description = this.id
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'TridentNode.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'TridentNode.svg'),
  }
}
