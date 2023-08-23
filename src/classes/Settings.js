/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Status from "./Status";
import Http from "./Http";
import Utils from "./Utils";


export default class Settings {

    static async getSettings(userId) {
        try {

            let dbKey = `${userId}_setting`

            // fetch the settings 
            let settingsStr = (localStorage.getItem(dbKey) || "{}").trim()

            let settings = JSON.parse(settingsStr)

            if(Object.keys(settings) == 0){
                let settingStatus = await this.fetchDefaultSettings()

                if(settingStatus.isError()){
                    return settingStatus
                }

                settings = settingStatus.getData()

                //update the settings db 
                localStorage.setItem(dbKey, JSON.stringify(settings))
            }

            return Status.success("", settings)
        } catch(e){
            return Utils.generalErrorStatus
        }
    }

    /**
     * check and update default settings
     */
    static async fetchDefaultSettings() {
        try {

            //let default settings 
            let defaultSettingsStr = localStorage.getItem("default_setting") || "{}"

            let fetch = false
            let defaultSettings = {}
            
            try {
                defaultSettings =  JSON.parse(defaultSettingsStr)

                if(Object.keys(defaultSettings).length == 0){
                    fetch = true
                }

                let networks = defaultSettings.networks || {}

                if(Object.keys(networks).length == 0){
                    fetch = true 
                }
            } catch(e){
                fetch = true
            }

            if(fetch){
                return this.fetchDefaultSettingsFromServer()
            }

            return Status.successPromise("", defaultSettings)
        } catch(e){
            return Status.error("Default settings checks failed")
        }
    }

    static async fetchDefaultSettingsFromServer() {
        try {

            let resultStatus = await Http.getApi("/settings?r="+Date.now())

            //console.log("resultStatus==>", resultStatus)

            if(resultStatus.isError()){
                return resultStatus
            }

            let data = resultStatus.getData() || {}

            if(Object.keys(data).length == 0){
                return Status.error("Server returned empty default settings ")
            }

            //serialize it and save it 
            let dataJson = JSON.stringify(data)

            localStorage.setItem("default_setting", dataJson)

            return resultStatus

        } catch(e){
            return Status.error("failed to fetch default settings")
        }
    }

}