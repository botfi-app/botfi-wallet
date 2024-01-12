/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import tinycolor from "tinycolor2";
import PWACore from "../classes/platforms/PWACore";
import EventBus from "../classes/EventBus"


export default {

    install: (app, options={}) => {

        enforceFixedSize()

        let botUtils = (new PWACore())

        window.botUtils = botUtils;
        
        app.provide("botUtils", botUtils)

        
    }
}

const isStandalone = () => (window.matchMedia('(display-mode: standalone)').matches 
|| window.navigator.standalone === true)


const enforceFixedSize = () => {

    if(!isStandalone()) return;
    
    let width = 400;
    let height = (0.8) * window.screen.height;

    // Size window after open the app
    window.resizeTo(width, height) 

    window.addEventListener('resize', (e) => {
        //e.preventDefault()
        window.resizeTo(width, height)
    })
}