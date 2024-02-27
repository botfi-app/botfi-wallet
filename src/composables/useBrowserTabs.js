/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, computed, toValue } from "vue"
import Status from "../classes/Status"
import app from "../config/app"
import { useSimpleDB } from "./useSimpleDB"
import EventBus from "../classes/EventBus"
import browser from "../config/browser"


export const useBrowserTabs = () => {

    const db = useSimpleDB()

    onBeforeMount(async ()=>{
        await getTabs()
    })

    const saveTabs = async (tabs={}) => {

        tabs = toValue(tabs)
        
        if(tabs.length == 0) return Status.success()

        let c = 0;
        let processedTabs = []
        let primaryTabId;

        for(let tabId of Object.keys(tabs)){
            
            let { url, hidden } = tabs[tabId]
           
            if(url == browser.homepage) continue
            
            processedTabs[c] = url

            if(!hidden) primaryTabId = c

            c++;
        }

        let dataToSave = JSON.stringify({
                            primaryTabId,
                            tabs: processedTabs
                        })

        await db.setItem("browserTabs", dataToSave)
    }

    const getTabs = async () => {
        
        let dataStr = await db.getItem("browserTabs") || "[]"
        let dataJson = JSON.parse(dataStr)

        ///$state.value.tabs = dataJson

        return dataJson
    }

    return {
        saveTabs,
        getTabs
    }
}