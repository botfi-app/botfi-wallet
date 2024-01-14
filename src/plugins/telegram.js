/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import tinycolor from "tinycolor2";
import TelegramCore from "../classes/platforms/TelegramCore";
import EventBus from "../classes/EventBus"
import AppTheme from "../classes/AppTheme";

export default {
    install: (app, options={}) => {

        let { router } = options;
        
        ///ensureTelegramClient()

        router.beforeResolve((to, from, next) => {

            if(to.fullPath.startsWith("/error")) next()

            if(!ensureTelegramClient()){
                return false;
            }

            next();
        });

        //console.log("window.location.pathname===>", window.location.pathname)

        if(window.location.pathname.startsWith("/error")) return true;
        
        let telegram = window.Telegram;
        let webApp = telegram.WebApp

        AppTheme.setTheme(webApp.colorScheme, webApp.themeParams)

        webApp.onEvent("themeChanged", () => (
            AppTheme.setTheme(webApp.colorScheme, webApp.themeParams)
        ))

        webApp.onEvent("viewportChanged", () => {
           window.setTimeout(() => EventBus.emit("app_expanded", webApp.isExpanded), 100)
        })


        let botUtils = (new TelegramCore(telegram))

        window.botUtils = botUtils;

        //telegram.WebApp.sendData("/botfi Hello===>")
        
        app.provide("botUtils", botUtils)
    }

  }

const ensureTelegramClient = () => {

    if(window.location.pathname.startsWith("/error")){
        return true;
    }

    if(!("Telegram" in window)) {
        window.location = "/error/unknown-client"
        return false;
    }

    let t = window.Telegram;
    let webApp = t.WebApp || null

    if(!webApp || !webApp.initData || webApp.initData == ''){
        window.location = "/error/bad-telegram-client"
        return false
    }

    //finally 
    if(!webApp.initDataUnsafe || 
        Object.keys(webApp.initDataUnsafe).length == 0 ||
        !webApp.initDataUnsafe.user || 
        webApp.initDataUnsafe.user.id.toString() == ''
    ){
        window.location = "/error/unknown-telegram-client"
        return false
    }

    return true;

  }
