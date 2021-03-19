export interface SaveRecordRequest {
  tableName: string
  record: Record<string, unknown>
}
