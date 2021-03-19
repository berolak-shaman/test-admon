import { AppConfigInterface } from "./config.interface"

export class ConfigService {
  private readonly config: AppConfigInterface

  constructor() {
    this.config = this.buildConfig()
  }

  public get<T>(key?: string): T {
    if (!key) {
      return (this.config as unknown) as T
    }

    return this.getValueByPath(key) as T
  }

  /** возвращает значение из конфигурации по переданному пути */
  private getValueByPath(path: string): unknown {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = this.config

    for (const key of path.split(".")) {
      value = this.getValue(key, value)
      if (!value) {
        break
      }
    }

    return value
  }

  /** возвращает значение из объекта или undefined */
  private getValue(key: string, object: Record<string, unknown>): unknown {
    return object?.[key]
  }

  private buildConfig(): AppConfigInterface {
    return {
      app: {
        port: 3000,
        version: process.env?.npm_package_version || "unknown",
      },
      clickhouse: {
        host: this.getFromEnv("CH_HOST"),
        port: parseInt(this.getFromEnv("CH_PORT"), 10) || 8123,
        bufferMaxLen: parseInt(this.getFromEnv("CH_BUF_MAX_LEN"), 10) || 500,
        bufferSaveTimeout:
          parseInt(this.getFromEnv("CH_BUF_SAVE_TIMEOUT"), 10) || 60,
        defaultTable: this.getFromEnv("CH_DEFAULT_TABLE") || "records",
      },
      redis: {
        host: this.getFromEnv("REDIS_HOST"),
        port: parseInt(this.getFromEnv("REDIS_PORT"), 10) || 6379,
      },
    }
  }

  private getFromEnv(key: string): string {
    return process.env?.[key] || ""
  }
}
