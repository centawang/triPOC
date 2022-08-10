import { commands, ExtensionContext, Uri, workspace } from 'vscode'
import * as EventEmitter from 'eventemitter2'

import { BrowserClient } from './BrowserClient'
import { getConfig, getConfigs } from './Config'
import { Panel } from './Panel'
import { ExtensionConfiguration } from './ExtensionConfiguration'

export class PanelManager extends EventEmitter.EventEmitter2 {
  public panels: Set<Panel>
  public current: Panel | undefined
  public browser: BrowserClient
  public config: ExtensionConfiguration
  public defaultSiteRoot: string | undefined
  public defaultSite: string | undefined
  public defaultWorkspace: string | undefined
  public defaultProduct: string | undefined

  constructor(public readonly ctx: ExtensionContext) {
    super()
    this.panels = new Set()
    this.config = getConfigs(this.ctx)

    this.on('windowOpenRequested', (params) => {
      this.create(params.url)
    })
  }

  private async refreshSettings() {
    const prev = this.config

    this.config = {
      ...getConfigs(this.ctx),
      debugPort: prev.debugPort,
    }
  }

  public async create(startUrl: string | Uri = this.config.startUrl) {
    this.refreshSettings()

    if (!this.browser)
      this.browser = new BrowserClient(this.config, this.ctx)

    const panel = new Panel(this.config, this.browser)

    panel.once('disposed', () => {
      if (this.current === panel) {
        this.current = undefined
        commands.executeCommand('setContext', 'trident-poc-active', false)
      }
      this.panels.delete(panel)
      if (this.panels.size === 0) {
        this.browser.dispose()
        this.browser = new BrowserClient(this.config, this.ctx)
      }

      this.emit('windowDisposed', panel)
    })

    panel.on('windowOpenRequested', (params) => {
      this.emit('windowOpenRequested', params)
    })

    panel.on('focus', () => {
      this.current = panel
      commands.executeCommand('setContext', 'trident-poc-active', true)
    })

    panel.on('blur', () => {
      if (this.current === panel) {
        this.current = undefined
        commands.executeCommand('setContext', 'trident-poc-active', false)
      }
    })

    this.panels.add(panel)
    await panel.launch(startUrl.toString())

    this.emit('windowCreated', panel)

    this.ctx.subscriptions.push({
      dispose: () => panel.dispose(),
    })

    return panel
  }

  public async createFile(filepath: string | undefined) {
    if (!filepath)
      return

    const panel = await this.create(`file://${filepath}`)
    if (getConfig('trident-poc.localFileAutoReload')) {
      panel.disposables.push(
        workspace.createFileSystemWatcher(filepath, true, false, false).onDidChange(() => {
        // TODO: check filename
          panel.reload()
        }),
      )
    }
    return panel
  }

  public disposeByUrl(url: string) {
    this.panels.forEach((b: Panel) => {
      if (b.config.startUrl === url)
        b.dispose()
    })
  }
}
