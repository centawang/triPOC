import * as path from 'path'
import * as vscode from 'vscode'
import { ContentProvider } from './ContentProvider'

export class TridentProvider implements vscode.TreeDataProvider<TridentNode> {
  public pbiArtifactTypes: string[] = ['report', 'dashboard', 'dataflow', 'dataset', 'scorecard']
  constructor() { }

  getTreeItem(element: TridentNode): vscode.TreeItem {
    return element
  }

  getChildren(element?: TridentNode): Thenable<TridentNode[]> {
    if (element?.type === 'workspace') {
      const types: TridentNode[] = []
      this.pbiArtifactTypes.forEach((type): void => {
        const node = new TridentNode(type, '', type, element, vscode.TreeItemCollapsibleState.Collapsed)
        types.push(node)
      })
      return Promise.resolve(
        types,
      )
    }
    else if (element) {
      return Promise.resolve(ContentProvider.listArtifact(element?.type, element?.parent))
    }
    else {
      return Promise.resolve(ContentProvider.listWorkspace())
    }
  }
}

export class TridentNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly type: string,
    public readonly parent: TridentNode,
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
