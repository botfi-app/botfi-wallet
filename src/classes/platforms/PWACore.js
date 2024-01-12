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

    // cloud store
    cloudStore = ()  => this.notSupported()

}