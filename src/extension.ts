import { commands, debug, ExtensionContext, Uri, window } from 'vscode'

import { DebugProvider } from './DebugProvider'
import { PanelManager } from './PanelManager'

export function activate(ctx: ExtensionContext) {
  const manager = new PanelManager(ctx)
  const debugProvider = new DebugProvider(manager)

  ctx.subscriptions.push(

    debug.registerDebugConfigurationProvider(
      'browse-lite',
      debugProvider.getProvider(),
    ),

    commands.registerCommand('trident.search', async() => {
      try {
        const inputStr = await window.showInputBox()
        return await manager.current?.navigateTo(`${manager.defaultSiteRoot}/search?trident=1&product=${manager.defaultProduct}&searchQuery=${inputStr}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.home', async() => {
      try {
        return await manager.current?.navigateTo(`${manager.defaultSiteRoot}/home?trident=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.datahub', async() => {
      try {
        return await manager.current?.navigateTo(`${manager.defaultSiteRoot}/datahub?trident=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.createhub', async() => {
      try {
        return await manager.current?.navigateTo(`${manager.defaultSiteRoot}/groups/${manager.defaultWorkspace}/create?trident=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.browse', async() => {
      try {
        return await manager.current?.navigateTo(`${manager.defaultSiteRoot}/browse/recent/?trident=1&product=${manager.defaultProduct}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.workspace', async() => {
      try {
        const pick = await window.showQuickPick(
          [
            { label: 'Data Cloud UX Beijing PPE', description: '', target: '08e16a3a-2a88-4c40-946c-d186d4d555ce' },
            { label: 'mandyTest', description: '', target: '30ff1c5c-1161-4d6e-a4a3-a946b88b7c81' },
            { label: 'test0512', description: '', target: '87b98ea1-8f8b-4416-bdf4-2ce1490ad19e' },
            { label: 'shengchen-test', description: '', target: '801f77ee-83e2-4d20-ada3-276e56e58288' },
            { label: 'testOne0526', description: '', target: '744645a8-045e-4fee-a1f3-59e755acb691' },
            { label: 'testOnexx', description: '', target: '5a8216be-c796-4715-8be6-4ff4b525994f' },
            { label: 'testx', description: '', target: '1040d217-3ba9-4e5a-a961-16d190b57191' },
            { label: 'yaduTest11', description: '', target: 'f41d320d-a02c-4620-8a12-2bdb298c27be' },
          ],
          { placeHolder: 'Select a workspace' })
        manager.defaultWorkspace = pick?.target
        return await manager.current?.navigateTo(`${manager.defaultSiteRoot}/groups/${pick?.target}/list?trident=1&product=${pick?.target}`)
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
        return await manager.current?.navigateTo(`${manager.defaultSiteRoot}?trident=1&product=${pick?.target}`)
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
            { label: 'MSIT', description: 'Msit', target: 'https://https://msit.powerbi.com' },
          ],
          { placeHolder: 'Select the view to show when opening a window.' })
        manager.defaultSiteRoot = pick?.target
        manager.defaultProduct = 'powerbi'
        manager.defaultWorkspace = '08e16a3a-2a88-4c40-946c-d186d4d555ce'
        return await manager.create(`${pick?.target}?trident=1`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('browse-lite.openActiveFile', () => {
      const filename = window.activeTextEditor?.document?.fileName
      manager.createFile(filename?.toString())
    }),

    commands.registerCommand('browse-lite.controls.refresh', () => {
      manager.current?.reload()
    }),

    commands.registerCommand('browse-lite.controls.external', () => {
      manager.current?.openExternal(true)
    }),

    commands.registerCommand('browse-lite.controls.debug', async() => {
      const panel = await manager.current?.createDebugPanel()
      panel?.show()
    }),

  )

  try {
    // https://code.visualstudio.com/updates/v1_53#_external-uri-opener
    ctx.subscriptions.push(window.registerExternalUriOpener?.(
      'browse-lite.opener',
      {
        canOpenExternalUri: () => 2,
        openExternalUri(resolveUri: Uri) {
          manager.create(resolveUri)
        },
      },
      {
        schemes: ['http', 'https'],
        label: 'Open URL using Browse Lite',
      },
    ))
  }
  catch {}
}
