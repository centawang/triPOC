import { join } from 'path'
import fs from 'fs'
import * as cp from 'child_process';
import { Uri } from 'vscode'
import { ExtensionConfiguration } from './ExtensionConfiguration'

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

  public static async getWorkspace(): Promise<{label: string; description: string; target: string} []> {
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
