/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, computed, toValue } from "vue"
import Status from "../classes/Status"
import { useSimpleDB } from "./useSimpleDB"
import browser from "../config/browser"

const $state = ref({
    activeTabId: "",
    tabs: {}
})

export const useBrowserTabs = () => {

    const db = useSimpleDB()

    onBeforeMount(async ()=>{
        await getTabs()
    })


    const activeTabId = computed(() => $state.value.activeTabId )
    const tabItems = computed(() => $state.value.tabs )

    const saveTabs = async (tabs={}) => {

        tabs = toValue(tabs)
        
        //console.log("Hmmmm===>", tabs)

        if(Object.keys(tabs).length == 0) return Status.success()

        let activeTabId = "";
        let processedTabs = {}
       
        for(let tabId of Object.keys(tabs)){
            
            let { url, title, hidden } = tabs[tabId]
           
            //if(url == browser.homepage) continue
            
            processedTabs[tabId] = { id: tabId, url, title, hidden }

            if(!hidden) activeTabId = tabId
        }

        let dataToSave = JSON.stringify({
                            activeTabId,
                            tabs: processedTabs
                        })

        await db.setItem("browserTabs", dataToSave)

        let $s = $state.value 
        $s.tabs = processedTabs
        $s.activeTabId = activeTabId
    }

    const getTabs = async () => {
        
        let dataStr = await db.getItem("browserTabs") || "{}"
        let dataJson = JSON.parse(dataStr)

        //console.log("dataStr===>", dataStr)

        if(Object.keys(dataStr).length > 0){
            $state.value.tabs        = dataJson.tabs
            $state.value.activeTabId = dataJson.activeTabId
        }

        return dataJson
    }

    return {
        saveTabs,
        getTabs,
        activeTabId,
        tabs: tabItems
    }
}