/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, computed, toValue } from "vue"
import { useSimpleDB } from "./useSimpleDB"


const $state = ref({
   connectedSites: {}
})

export const usePermission = () => {

    const db = useSimpleDB()

    onBeforeMount(async ()=>{
        await getConnectedSites()
    })

    const getConnectedSites = async () => {
        
        let dataStr = await db.getItem("connected_sites") || "{}"
        let dataJson = JSON.parse(dataStr)
        
        $state.value.connectedSites = dataJson

        return dataJson
    }

    const connectedSites = computed(() => $state.value.connectedSites)

    const isSiteConnected = async (origin) => {
        let _connectedSites = await getConnectedSites()
        origin = origin.trim().toLowerCase()
        return (origin in _connectedSites)
    }

    const connectSite = async (origin) => {

        let connectedSites = await getConnectedSites()

        origin = origin.trim().toLowerCase()

        connectedSites[origin] = {}

        await db.setItem("connected_sites", JSON.stringify(connectedSites))

        return getConnectedSites()
    }

    return {
        isSiteConnected,
        connectedSites,
        getConnectedSites,
        connectSite
    }
}