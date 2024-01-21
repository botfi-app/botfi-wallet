/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

export default class PWACore {

    botPlatform = "pwa"
    router = null

    constructor(router) {
        this.router = router
    }
   
    // get account 
    getUserInfo() {
        return {
            id: "", 
            username: "",
            firstName: "",
            lastName: ""
        }
    }

    getUid() {
        return `${this.botPlatform}`
    }

    notSupported() {
        return { isSupported: () => false }
    }

    getViewportHeight() {
        return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    }

    isExpanded  = () => true

    platform() {
        return this.platform
    }

    backBtn = (onClick = null) => this.notSupported()

    DB = () => window.localStorage
    
    clipboard() {

        //console.log("this.webApp.version====>", this.webApp.version)
        //let _p = this.webApp.platform.toLowerCase()
        let isSupported =  ('clipboard' in navigator)

        if(!isSupported){
            return this.notSupported()
        }

        return {
            isSupported: () => isSupported,
            readText: (callback) => navigator.clipboard.readText().then(callback)
        }
    }
}