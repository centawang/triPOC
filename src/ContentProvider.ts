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

  public static async listWorkspace(): Promise<TridentNode[]> {
    const workspaceItems: TridentNode [] = []
    const workspaces = JSON.parse(await this.execShell('pbicli workspace list'))
    workspaces.forEach((element) => {
      const item = new TridentNode(element.name, element.id, 'workspace', element.toString(), TreeItemCollapsibleState.Collapsed)
      item.command = { command: 'trident.openWorkspace', title: 'Open Workspace', arguments: [element.id] }
      workspaceItems.push(item)
    })
    return workspaceItems
  }

  public static async listArtifact(type: string, workspace: TridentNode): Promise<TridentNode[]> {
    const items: TridentNode [] = []
    const result = await this.execShell(`pbicli ${type} list -w "${workspace.label}"`)
    if (type === 'trident') {
      const all = JSON.parse(result)
      const artifacts = all.artifacts['a:ArtifactMetadata']
      const element = artifacts
      console.log(`add artifact ${artifacts}`)
      if (artifacts === undefined)
        return items
      if (element['a:artifactType']) {
        const item = new TridentNode(element['a:displayName'], element['a:objectId'], element['a:artifactType'], element, TreeItemCollapsibleState.None)
        console.log(`add artifact ${workspace.id},${item.type},${item.label},${item.id}`)
        item.command = { command: 'trident.openArtifact', title: 'Open Artifact', arguments: [workspace.id, item.type.toLocaleLowerCase(), item.id] }
        items.push(item)
      }
      else {
        artifacts.forEach((element) => {
          const item = new TridentNode(element['a:displayName'], element['a:objectId'], element['a:artifactType'], element, TreeItemCollapsibleState.None)
          console.log(`add artifact ${workspace.id},${item.type},${item.label},${item.id}`)
          item.command = { command: 'trident.openArtifact', title: 'Open Artifact', arguments: [workspace.id, item.type.toLocaleLowerCase(), item.id] }
          items.push(item)
        })
      }
    }
    else {
      const artifacts = JSON.parse(result)
      artifacts.forEach((element) => {
        const item = new TridentNode(element.name ? element.name : element.displayName, element.id, type, element, TreeItemCollapsibleState.None)
        console.log(`add artifact ${workspace.id},${type},${item.id}`)
        item.command = { command: 'trident.openArtifact', title: 'Open Artifact', arguments: [workspace.id, type, element.id] }
        items.push(item)
      })
    }
    return items
  }

  public static async listWorkspaceAsPickup(): Promise<{label: string; description: string; target: string} []> {
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
