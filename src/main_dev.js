import { startApp } from "./main_core.js"
import telegramPlugin from "./plugins/telegram.js"
import capacitorPlugin from "./plugins/capacitor"


startApp({ 
    telegram:  telegramPlugin,
    capacitor: capacitorPlugin 
})