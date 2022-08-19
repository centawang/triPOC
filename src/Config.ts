import { createServer } from 'http'
import { ExtensionContext, workspace } from 'vscode'
import { ExtensionConfiguration } from './ExtensionConfiguration'

export function getConfig<T>(key: string, v?: T) {
  return workspace.getConfiguration().get(key, v)
}

export function isDarkTheme() {
  const theme = getConfig('workbench.colorTheme', '').toLowerCase()

  // must be dark
  if (theme.match(/dark|black/i) != null)
    return true

  // must be light
  if (theme.match(/light/i) != null)
    return false

  // IDK, maybe dark
  return true
}

function isPortFree(port: number) {
  return new Promise((resolve) => {
    const server = createServer()
      .listen(port, () => {
        server.close()
        resolve(true)
      })
      .on('error', () => {
        resolve(false)
      })
  })
}
export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function tryPort(start = 4000): Promise<number> {
  if (await isPortFree(start))
    return start
  return tryPort(start + 1)
}

export function getConfigs(ctx: ExtensionContext): ExtensionConfiguration {
  return {
    extensionPath: ctx.extensionPath,
    columnNumber: 2,
    isDebug: false,
    quality: getConfig('trident-poc.quality', 100),
    everyNthFrame: getConfig('trident-poc.everyNthFrame', 1),
    format: getConfig('trident-poc.format', 'png'),
    isVerboseMode: getConfig('trident-poc.verbose', false),
    chromeExecutable: getConfig('trident-poc.chromeExecutable'),
    startUrl: getConfig('trident-poc.startUrl', 'https://github.com/antfu/vscode-trident-poc'),
    debugHost: getConfig('trident-poc.debugHost', 'localhost'),
    debugPort: getConfig('trident-poc.debugPort', 9222),
    storeUserData: getConfig('trident-poc.storeUserData', true),
  }
}
