import dotenv from "dotenv"
dotenv.config()

export { AppConfigInterface } from "./config.interface"
import { ConfigService } from "./config.service"

export const configService = new ConfigService()
