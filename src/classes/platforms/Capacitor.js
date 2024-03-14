/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */
import { Preferences as sharedPerf } from '@capacitor/preferences';
import { Clipboard } from '@capacitor/clipboard';


export default class Capacitor {

    botPlatform = "capacitor"
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

    DB = () => ({
        setItem: async (key, value) => sharedPerf.set({key, value}),
        getItem: async (key) => (await sharedPerf.get({ key })).value,
        removeItem: async (key) => sharedPerf.remove({ key }),
    })

    clipboard() {

        let isSupported =  true

        return {
            isSupported: () => isSupported,
            readText: (callback) => {
                Clipboard.read().then((result)=>{
                    callback(result.value || "")
                })
            }
        }
    }
    
  

}