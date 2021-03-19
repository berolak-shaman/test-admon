import { ClickhouseService } from "../clickhouse"
import { RedisService } from "../redis"
import { SaveRecordRequestInterface } from "./routes/interfaces/save-record.request.interface"

export class ApiService {
  constructor(
    private readonly clickhouseService: ClickhouseService,
    private readonly redisService: RedisService,
  ) {}

  saveRecord(record: SaveRecordRequestInterface) {
    console.log(record)
  }
}
