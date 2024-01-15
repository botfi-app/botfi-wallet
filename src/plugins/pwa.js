/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import tinycolor from "tinycolor2";
import PWACore from "../classes/platforms/PWACore";
import EventBus from "../classes/EventBus"
import default_theme from "../config/default_theme";
import AppTheme from "../classes/AppTheme";


export default {

    install: (app, options={}) => {

        enforceFixedSize()

        ensureStandaloneMode()

        let botUtils = (new PWACore())

        window.botUtils = botUtils;
        
        app.provide("botUtils", botUtils)

        
    }
}

const isStandalone = () => (window.matchMedia('(display-mode: standalone)').matches 
|| window.navigator.standalone === true)


const ensureStandaloneMode = async() => {
    //if(isStandalone()) return;
}

const enforceFixedSize = () => {

    //if(!isStandalone()) return;
    
    let width = 500;
    let height = (0.8) * window.screen.height;

    // Size window after open the app
    window.resizeTo(width, height) 

    window.addEventListener('resize', (e) => {
        //e.preventDefault()
        window.resizeTo(width, height)
    })

    AppTheme.setTheme("dark", default_theme.dark)
}