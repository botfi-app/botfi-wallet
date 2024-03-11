import { startApp } from "./main_core.js"
import telegramPlugin from "./plugins/telegram.js"

startApp({ telegram: telegramPlugin })