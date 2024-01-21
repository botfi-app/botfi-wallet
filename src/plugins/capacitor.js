/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import tinycolor from "tinycolor2";
import Capacitor from "../classes/platforms/Capacitor";
import EventBus from "../classes/EventBus"
import default_theme from "../config/default_theme";
import AppTheme from "../classes/AppTheme";
import { StatusBar } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { App as CApp } from '@capacitor/app';


export default {

    install: (app, opts = {}) => {

        let { router } = opts;

        console.log(router)

        handleUI()
        handleBackBtn(router)

        AppTheme.setTheme("dark", default_theme.dark)

        StatusBar.setOverlaysWebView({ overlay: true });

       // StatusBar.hide();
        
        let botUtils = (new Capacitor())

        window.botUtils = botUtils;
        
        app.provide("botUtils", botUtils)
       
    }
}

const handleUI = async () => {
    // fix statusbar
    let dInfo = await  Device.getInfo()

    if(dInfo.operatingSystem.toLowerCase() == 'android'){
        document.body.style.paddingTop = '25px' 
    }
}

const handleBackBtn = (router) => {
    CApp.addListener('backButton', ({ canGoBack }) => {

        console.log("router===>", router)
        let curRoute = router.currentRoute.value.path;

        console.log("curRoute===>", curRoute)

        if(curRoute == "/" || curRoute.startsWith("/wallet")){
            // todo confirm exit app
            return;
        } else {
            if(canGoBack){
                router.back()
            } else {
                router.push("/wallet")
            }
        }
    });
      
}