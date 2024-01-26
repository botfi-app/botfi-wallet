/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import PWACore from "../classes/platforms/PWACore";
import default_theme from "../config/default_theme";
import AppTheme from "../classes/AppTheme";


export default {

    install: (app, options={}) => {

        enforceFixedSize()

        let botUtils = (new PWACore())

        window.botUtils = botUtils;
        
        app.provide("botUtils", botUtils)
        
    }
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