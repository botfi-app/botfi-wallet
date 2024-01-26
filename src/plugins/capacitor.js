/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import Capacitor from "../classes/platforms/Capacitor";
import EventBus from "../classes/EventBus"
import default_theme from "../config/default_theme";
import AppTheme from "../classes/AppTheme";
///import { StatusBar } from '@capacitor/status-bar';
//import { Device } from '@capacitor/device';
import { App as CApp } from '@capacitor/app';
import { StatusBar } from "@capacitor/status-bar";
import Utils from "../classes/Utils";
//import { SafeArea } from 'capacitor-plugin-safe-area';

EventBus.on("themeChange", async({ scheme, themeParams }) => {
    await StatusBar.setBackgroundColor({ color: themeParams.bg_color})
})

export default {

    install: (app, opts = {}) => {

        let { router } = opts;

        handleBackBtn(router)

        AppTheme.setTheme("dark", default_theme.dark)

        
        let botUtils = (new Capacitor())

        window.botUtils = botUtils;
        
        app.provide("botUtils", botUtils)
       
    }
}


const handleBackBtn = (router) => {
    CApp.addListener('backButton', async ({ canGoBack }) => {

        //console.log("router===>", router)
        let curRoute = router.currentRoute.value.path;

        //console.log("curRoute===>", curRoute)

        if(curRoute == "/" || curRoute.startsWith("/wallet")){
            let  confirm = await Utils.getSwal().fire({
                title: "Confirm Exit",
                text: "Do you want to exit the app?",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "Yes!"
            })

            if(confirm.isConfirmed){
                return CApp.exitApp()
            }

        } else {
            if(canGoBack){
                router.back()
            } else {
                router.push("/wallet")
            }
        }
    });
      
}