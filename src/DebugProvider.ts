import { window, CancellationToken, commands, debug, DebugConfiguration, DebugConfigurationProvider, DebugSession, ProviderResult, WorkspaceFolder, DebugAdapterTracker } from 'vscode'
import { PanelManager } from './PanelManager'
import { getUnderlyingDebugType } from './UnderlyingDebugAdapter';

export class DebugProvider {
  private readonly underlyingDebugType = getUnderlyingDebugType()

  constructor(private manager: PanelManager) {    
    debug.onDidTerminateDebugSession((e: DebugSession) => {
      if (e.name === 'Trident POC: Launch' && e.configuration.urlFilter) {
        // TODO: Improve this with some unique ID per browser window instead of url, to avoid closing multiple instances
        this.manager.disposeByUrl(e.configuration.urlFilter)
      }
    });

    debug.registerDebugAdapterTrackerFactory(
      this.underlyingDebugType,
      {
        createDebugAdapterTracker(session: DebugSession): ProviderResult<DebugAdapterTracker> {
          const config = session.configuration
          if (!config._browseLite || !config._browseLiteLaunch) {
            return undefined
          }
          return manager.create(config._browseLiteLaunch).then(() => undefined)
        }
    });
  }

  getProvider(): DebugConfigurationProvider {
    const manager = this.manager
    const debugType = this.underlyingDebugType

    return {
      provideDebugConfigurations(
        folder: WorkspaceFolder | undefined,
        token?: CancellationToken,
      ): ProviderResult<DebugConfiguration[]> {
        return Promise.resolve([
          {
            type: 'trident-poc',
            name: 'Trident POC: Attach',
            request: 'attach',
          },
          {
            type: 'trident-poc',
            request: 'launch',
            name: 'Trident POC: Launch',
            url: 'http://localhost:3000',
          },
        ])
      },
      resolveDebugConfiguration(
        folder: WorkspaceFolder | undefined,
        config: DebugConfiguration,
        token?: CancellationToken,
        // @ts-ignore
      ): ProviderResult<DebugConfiguration> {
        if (!config || config.type !== 'trident-poc') {
          return null
        }

        config.type = debugType
        config._browseLite = true

        if (config.request === 'launch') {
          config.name = 'Trident POC: Launch'
          config.port = manager.config.debugPort
          config.request = 'attach'
          config.urlFilter = config.url
          config._browseLiteLaunch = config.url

          if (config.port === null) {
            window.showErrorMessage(
              'Could not launch Trident POC window',
            )
          } else {
            return config
          }
        } else if (config.request === 'attach') {
          config.name = 'Trident POC: Attach'
          config.port = manager.config.debugPort

          if (config.port === null) {
            window.showErrorMessage(
              'No Trident POC window was found. Open a Trident POC window or use the "launch" request type.',
            );
          } else {
            return config
          }
        } else {
          window.showErrorMessage(
            'No supported launch config was found.',
          )
        }
      },
    }
  }
}
