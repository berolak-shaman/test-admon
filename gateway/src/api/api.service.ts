import { RedisService } from "../redis"
import { SaveRecordRequest } from "./routes/interfaces/save-record.request.interface"

export class ApiService {
  constructor(
    private readonly redisService: RedisService,
  ) {}

  saveRecord(record: SaveRecordRequest) {
    console.log(record)
  }

  saveRecords(records: SaveRecordsRequest) {
    console.log(records)
  }
}
