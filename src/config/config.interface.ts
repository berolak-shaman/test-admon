export interface AppConfigInterface {
  app: {
    port: number
    version: string
  }
  clickhouse: {
    /** CH_HOST */
    host: string
    /** CH_PORT */
    port: number
    /** максимальный объем буфера, после которого происходит запись в CH. CH_BUF_MAX_LEN */
    bufferMaxLen: number
    /** максимальное время ожидания в секундах, после которого буфер будет записан в любом случае. CH_BUF_SAVE_TIMEOUT */
    bufferSaveTimeout: number
    /** таблица для записи по-умолчанию. CH_DEFAULT_TABLE */
    defaultTable: string
  }
  redis: {
    /** REDIS_HOST */
    host: string
    /** REDIS_PORT */
    port: number
  }
}
