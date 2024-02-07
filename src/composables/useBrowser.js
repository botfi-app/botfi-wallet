/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, computed, toValue } from "vue"
import Wallet from "../classes/Wallet"
import Status from "../classes/Status"
import app from "../config/app"
import { useSimpleDB } from "./useSimpleDB"
import injectScript from "../config/browser/injectScript"
import Utils from "../classes/Utils"
import ErrorCodes from "../classes/ErrorCodes"
import rpcMethods from "../config/browser/rpcMethods"

const $state = ref({
   connectedSites: []
})

export const useBrowser = () => {

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

    const getInjectScript = (tabId) => {
        return injectScript(tabId)
    }

    const getRpcMethodInfo = (name="") => {

        if(name.trim() == "") return null

        let methodInfo = rpcMethods[name] || null 
        if(methodInfo == null) return methodInfo

        if("alias" in methodInfo && methodInfo.alias.length > 0){
            return getRpcMethodInfo(methodInfo.alias)
        }

        return methodInfo
    }

    const _processWebMessage = async(sourceOrigin, method, params) => {
        try {

            if(!validator.isURL(sourceOrigin)){
                return Status.error("Invalid source origin")
                              .setCode(ErrorCodes.invalidRequest)
            }
            
            // firstly, lets check if user is connected
            if(!["eth_accounts","eth_requestAccounts"].includes(method)){
                if(isSiteConnected(sourceOrigin)){
                    return Status.error("Wallet not connected")
                                .setCode(ErrorCodes.unauthorized)
                }
            }

            if(method.trim() == ""){
                return Status.error("Request method name required")
                             .setCode(ErrorCodes.invalidRequest)
            }

            //lets check if the requested method exists
            let rpcMethodInfo = getRpcMethodInfo(method)

            if(rpcMethodInfo == null){
                return Status.error("Request method not found")
                            .setCode(ErrorCodes.methodNotFound) 
            }
            

            if(rpcMethodInfo.hasPermission){

            }

            return Status.success()
        } catch(e){
            Utils.logError("useBrowser#processWebMessage:", e)
            return Status.error("Failed to process data")
                         .setCode(ErrorCodes.PROCESSING_ERROR)
        }
    }

    const processWebMessage = async(webview, dataObj) => {

        const { sourceOrigin="", message="" } = dataObj
        const msgObj = JSON.parse(message)

        const requestData = msgObj.requestData || {}

        const method = requestData["method"] || ""
        const params = requestData["params"] || []

        let resultStatus = await  _processWebMessage(sourceOrigin, method, params)


       let result;

       if(resultStatus.isError()){
            result = new Error(resultStatus.getMessage())
            result.code = result.getCode()
        } else {
            result = resultStatus.getData()
        }

        
    } //end func
    
    return {
        getInjectScript,
        connectedSites,
        getConnectedSites,
        processWebMessage
    }
}

