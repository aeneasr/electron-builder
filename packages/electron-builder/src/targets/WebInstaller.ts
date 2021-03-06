import { Platform } from "electron-builder-core"
import { NsisWebOptions } from "../options/winOptions"
import { computeDownloadUrl, getPublishConfigs, getPublishConfigsForUpdateInfo } from "../publish/PublishManager"
import { WinPackager } from "../winPackager"
import NsisTarget from "./nsis"

export default class WebInstallerTarget extends NsisTarget {
  constructor(packager: WinPackager, outDir: string, targetName: string) {
    super(packager, outDir, targetName)
  }

  protected get isWebInstaller(): boolean {
    return true
  }

  protected async configureDefines(oneClick: boolean, defines: any) {
    //noinspection ES6MissingAwait
    const promise = (<any>NsisTarget.prototype).configureDefines.call(this, oneClick, defines)
    await promise

    const packager = this.packager
    const options = this.options

    let appPackageUrl = (<NsisWebOptions>options).appPackageUrl
    if (appPackageUrl == null) {
      const publishConfigs = await getPublishConfigsForUpdateInfo(packager, await getPublishConfigs(packager, this.options, false))
      if (publishConfigs == null || publishConfigs.length === 0) {
        throw new Error("Cannot compute app package download URL")
      }

      appPackageUrl = computeDownloadUrl(publishConfigs[0], null, packager.appInfo.version, {
        os: Platform.WINDOWS.buildConfigurationKey,
        arch: ""
      })

      defines.APP_PACKAGE_URL_IS_INCOMLETE = null
    }

    defines.APP_PACKAGE_URL = appPackageUrl
  }

  protected get installerFilenamePattern(): string {
    return "${productName} Web Setup ${version}.${ext}"
  }

  protected generateGitHubInstallerName(): string {
    return `${this.packager.appInfo.name}-WebSetup-${this.packager.appInfo.version}.exe`
  }
}