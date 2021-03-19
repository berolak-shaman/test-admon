export interface SaveRecordsRequest {
  tableName: string
  records: Array<Record<string, unknown>>
}