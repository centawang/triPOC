import { commands, debug, ExtensionContext, window } from 'vscode'
import { ContentProvider } from './ContentProvider'

import { DebugProvider } from './DebugProvider'
import { PanelManager } from './PanelManager'
import { TridentProvider } from './TridentProvider'

export function activate(ctx: ExtensionContext) {
  const manager = new PanelManager(ctx)
  const debugProvider = new DebugProvider(manager)

  ctx.subscriptions.push(

    debug.registerDebugConfigurationProvider(
      'trident-poc',
      debugProvider.getProvider(),
    ),

    commands.registerCommand('trident.search', async() => {
      try {
        const inputStr = await window.showInputBox()
        return await manager.goto(`${manager.defaultSiteRoot}/search?trident=1&inVSCode=1&product=${manager.defaultProduct}&searchQuery=${inputStr}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.home', async() => {
      try {
        return await manager.goto(`${manager.defaultSiteRoot}/home?trident=1&inVSCode=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.datahub', async() => {
      try {
        return await manager.goto(`${manager.defaultSiteRoot}/datahub?trident=1&inVSCode=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.createhub', async() => {
      try {
        return await manager.goto(`${manager.defaultSiteRoot}/groups/${manager.defaultWorkspace}/create?trident=1&inVSCode=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.browse', async() => {
      try {
        return await manager.goto(`${manager.defaultSiteRoot}/browse/recent/?trident=1&inVSCode=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.openWorkspace', async(id: string) => {
      try {
        console.log(`open workspace${id}`)
        manager.defaultWorkspace = id
        return await manager.goto(`${manager.defaultSiteRoot}/groups/${id}/list?trident=1&inVSCode=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.openArtifact', async(workspaceId: string, type: string, id: string) => {
      try {
        const url = `${manager.defaultSiteRoot}/groups/${workspaceId}/${type}s/${id}?trident=1&inVSCode=1&clientSideAuth=1&product=${manager.defaultProduct}`
        console.log(`open artifact ${url}`)
        manager.defaultWorkspace = workspaceId
        return await manager.goto(url)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.workspace', async() => {
      try {
        const workspaces = await ContentProvider.listWorkspaceAsPickup()
        const pick = await window.showQuickPick(
          workspaces,
          { placeHolder: 'Select a workspace' })
        manager.defaultWorkspace = pick?.target
        return await manager.goto(`${manager.defaultSiteRoot}/groups/${pick?.target}/list?trident=1&inVSCode=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.switch', async() => {
      try {
        const pick = await window.showQuickPick(
          [
            { label: 'PowerBI', description: 'powerbi', target: 'powerbi' },
            { label: 'DE', description: 'data engineering', target: 'data-engineering' },
            { label: 'DI', description: 'data integration', target: 'data-integration' },
            { label: 'Kusto', description: 'kusto', target: 'kusto' },
          ],
          { placeHolder: 'Select a product' })
        manager.defaultProduct = pick?.target
        return await manager.goto(`${manager.defaultSiteRoot}?trident=1&inVSCode=1&product=${pick?.target}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.open', async() => {
      try {
        const pick = await window.showQuickPick(
          [
            { label: 'DF', description: 'Dogfood', target: 'https://powerbi-df.analysis-df.windows.net' },
            { label: 'dxt', description: 'dxt', target: 'https://daily.powerbi.com' },
          ],
          { placeHolder: 'Select the view to show when opening a window.' })
        manager.defaultSiteRoot = pick?.target
        manager.defaultSite = pick?.label
        manager.defaultProduct = 'powerbi'
        manager.defaultWorkspace = '08e16a3a-2a88-4c40-946c-d186d4d555ce'
        return await manager.goto(`${pick?.target}?trident=1&inVSCode=1`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident-poc.openActiveFile', () => {
      const filename = window.activeTextEditor?.document?.fileName
      manager.createFile(filename?.toString())
    }),

    commands.registerCommand('trident-poc.controls.refresh', () => {
      manager.current?.reload()
    }),

    commands.registerCommand('trident-poc.controls.external', () => {
      manager.current?.openExternal(true)
    }),

    commands.registerCommand('trident-poc.controls.debug', async() => {
      const panel = await manager.current?.createDebugPanel()
      panel?.show()
    }),

  )
  const tridentProvider = new TridentProvider()
  window.registerTreeDataProvider('tridentTree', tridentProvider)
}
