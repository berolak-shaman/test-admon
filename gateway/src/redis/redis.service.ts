import fs from "fs/promises"
import redis, { RedisClient } from "redis"
import { promisify } from "util"

import { AppConfigInterface, configService } from "../config"

type ClassMethodsNames<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

type RedisClientMethodsNames = ClassMethodsNames<RedisClient>

type PromisifyFunction<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T

type PromisifyRedisMethods = {
  [K in RedisClientMethodsNames]: PromisifyFunction<RedisClient[K]>
}

interface ScriptHashes {
  addRecords: string
}

export class RedisService {
  private readonly redisConfig = configService.get<AppConfigInterface["redis"]>(
    "redis",
  )
  private readonly clickhouseConfig = configService.get<
    AppConfigInterface["clickhouse"]
  >("clickhouse")

  private client: RedisClient
  private db: PromisifyRedisMethods
  private scriptHashes: ScriptHashes = {} as ScriptHashes

  constructor() {
    const client = (this.client = redis.createClient({
      ...this.redisConfig,
      retry_strategy: function (options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
          // End reconnecting on a specific error and flush all commands with
          // a individual error
          return new Error("The server refused the connection")
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout and flush all commands
          // with a individual error
          return new Error("Retry time exhausted")
        }
        if (options.attempt > 10) {
          // End reconnecting with built in error
          return undefined
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000)
      },
    }))

    this.db = this.promisifyRedisClient(client)
    console.log(this.db)
    this.initAddScript()
      .then(
        async () =>
          await this.addToSet("test", ["sdfdsfsdf", '{"test": 4455}']),
      )
      .catch(console.error)
  }

  async addToSet(table: string, records: string[]): Promise<void> {
    console.log(this.db)
    const r = await this.db.evalsha(
      ...this.buildAddRecordParams(table, records),
    )

    console.log({ r })
  }

  private buildAddRecordParams(
    table: string,
    records: string[],
  ): (string | number)[] {
    const { bufferMaxLen, bufferSaveTimeout } = this.clickhouseConfig

    return [
      this.scriptHashes.addRecords,
      table,
      bufferMaxLen,
      bufferSaveTimeout,
      ...records,
    ]
  }

  private async initAddScript() {
    try {
      const script = await fs.readFile("./redis-lua/addRecord.lua", "utf8")

      this.scriptHashes.addRecords = await new Promise((resolve, reject) => {
        this.client
          .multi()
          .script("LOAD", script)
          .exec((err, result) => {
            if (err) {
              return reject(err)
            }

            resolve(result[0])
          })
      })
    } catch (error) {
      console.log({ error })
    }
  }

  private promisifyRedisClient(
    redisClient: RedisClient,
  ): PromisifyRedisMethods {
    return Object.entries(redisClient).reduce(
      (obj, [key, val]: [string, unknown]) => {
        console.log({ key, val, type: typeof val })
        if (typeof val === "function") {
          obj[key as RedisClientMethodsNames] = promisify(val).bind(redisClient)
        }
        return obj
      },
      {} as PromisifyRedisMethods,
    )
  }
}
