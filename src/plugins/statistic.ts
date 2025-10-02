import type {SiteConfig} from "@config/types";

type Provider = SiteConfig["statistics"]["provider"];

abstract class BaseStatistic {
  _provider: Provider;
  _config: SiteConfig["statistics"];
  _enabled: boolean;
  _trackerParams: Record<string, any> | null = null;

  protected constructor(config: SiteConfig["statistics"], instanceProvider: Provider) {
    this._config = config;
    this._enabled = config.enabled;
    this._provider = instanceProvider;
    if (!this._enabled) {
      throw Error("Statistics function is not enabled");
    }
    if (config.parameters) {
      try {
        this._trackerParams = JSON.parse(config.parameters);
      } catch (e) {
        throw Error("Failed to parse statistics parameters: " + e);
      }
    }
  }

  abstract getScriptHtml(): string;
}


class UmamiStatistic extends BaseStatistic {
  _template: string = (
    '<script async src="{src}" data-website-id="{websiteId}"></script>'
  );

  constructor(config: SiteConfig["statistics"]) {
    super(config, "umami");
    if (config.provider !== this._provider) {
      throw new Error("Invalid provider for UmamiStatistic");
    }
    if (!config.trackerUrl) {
      throw new Error("Tracker URL is required for UmamiStatistic");
    }
    if (!this._trackerParams || !this._trackerParams["data-website-id"]) {
      throw new Error("data-website-id parameter is required for UmamiStatistic");
    }
    return this;
  }

  getScriptHtml(): string {
    return this._template
      .replace("{src}", this._config.trackerUrl || '')
      .replace("{websiteId}", this._trackerParams?.["data-website-id"] || '');
  }
}

export function createStatisticInstance(config: SiteConfig["statistics"]): BaseStatistic | null {
  if (!config.enabled) {
    return null;
  }
  switch (config.provider) {
    case "umami":
      return new UmamiStatistic(config);
    case "counterscale":
      // return new CounterScaleStatistic(config);
      throw new Error("CounterScaleStatistic is not implemented yet");
    case "none":
      return null;
    default:
      throw new Error(`Unsupported statistics provider: ${config.provider}`);
  }
}
