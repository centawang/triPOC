import { join } from 'path'
import fs from 'fs'
import * as cp from 'child_process'
import { TreeItemCollapsibleState, Uri } from 'vscode'
import { ExtensionConfiguration } from './ExtensionConfiguration'
import { TridentNode } from './TridentProvider'

export class ContentProvider {
  constructor(private config: ExtensionConfiguration) { }
  public static execShell = (cmd: string) =>
    new Promise<string>((resolve, reject) => {
      cp.exec(cmd, (err, out) => {
        if (err)
          return reject(err)
        return resolve(out)
      })
    })

  public static async getWorkspaceAsTridentNode(): Promise<TridentNode[]> {
    const workspaceItems: TridentNode [] = []
    const workspaces = JSON.parse(await this.execShell('pbicli workspace list'))
    workspaces.forEach((element) => {
      const item = new TridentNode(element.name, element.id, 'workspace', element.toString(), TreeItemCollapsibleState.Collapsed)
      item.command = { command: 'trident.openWorkspace', title: 'Open Workspace', arguments: [element.id] }
      workspaceItems.push(item)
    })
    return workspaceItems
  }

  public static async getWorkspaceAsPickup(): Promise<{label: string; description: string; target: string} []> {
    const workspaceItems: {label: string; description: string; target: string} [] = []
    const workspaces = JSON.parse(await this.execShell('pbicli workspace list'))
    workspaces.forEach((element) => {
      workspaceItems.push({ label: element.name, description: '', target: element.id })
    })
    return workspaceItems
  }

  getContent() {
    const root = join(this.config.extensionPath, 'dist/client')
    const indexHTML = fs.readFileSync(join(root, 'index.html'), 'utf-8')

    return indexHTML.replace(
      /(src|href)="(.*?)"/g,
      (_, tag, url) => `${tag}="${Uri.file(join(root, url.slice(1))).with({ scheme: 'vscode-resource' })}"`,
    )
  }
}
