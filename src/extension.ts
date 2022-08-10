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

    commands.registerCommand('trident.switch', async() => {
      try {
        const pick = await window.showQuickPick(
          [
            { label: 'PowerBI', description: 'Msit', target: 'powerbi' },
            { label: 'DE', description: 'Msit', target: 'data-engineering' },
            { label: 'DI', description: 'Msit', target: 'data-integration' },
            { label: 'Kusto', description: 'Msit', target: 'kusto' },
          ],
          { placeHolder: 'Select the view to show when opening a window.' });
        return await manager.current?.navigateTo(`https://powerbi-df.analysis-df.windows.net/home?trident=1&product=${pick?.target}`)
      }
      catch (e) {
        console.error(e)
      }
    }),

    commands.registerCommand('trident.open', async() => {
      try {
        const pick = await window.showQuickPick(
          [
            { label: 'DF', description: 'Dogfood', target: 'https://powerbi-df.analysis-df.windows.net/home?trident=1' },
          ],
          { placeHolder: 'Select the view to show when opening a window.' });
        return await manager.create(pick?.target)
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
