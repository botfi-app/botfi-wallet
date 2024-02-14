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
import { isURL } from 'validator'
import { usePermission } from "./usePermission"
import { useWalletStore } from "../store/walletStore"
import { useNetworks } from "./useNetworks"
import EventBus from "../classes/EventBus"
import { useTx } from "./useTx"


export const useBrowser = () => {

    const permission  = usePermission()
    const walletStore = useWalletStore()
    const netCore     = useNetworks()
    const txCore      = useTx()

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

    const processPermissionText = async ({method, text, origin, params}) => {
        
        let parsedDomain = new URL(origin)

        text = text.replace("{{WEBSITE}}", `<strong>${parsedDomain.hostname}</strong>`)

        if(["wallet_addEthereumChain"].includes(method)){
            let paramObj = params[0]
            let chainName = paramObj.chainName
            let chainId = paramObj.chainId

            text = text.replace("{{CHAIN_NAME}}", chainName)
                                .replace("{{CHAIN_ID}}", chainId)
        } 
        else if(method == "wallet_switchEthereumChain"){
            let chainId = parseInt(params[0], 16)
            let chainInfo = (await netCore.getUserNetworks())[chainId] || null

            if(chainInfo){
                text = text.replace("{{CHAIN_NAME}}", chainInfo.name)
                           .replace("{{CHAIN_ID}}", chainInfo.id)
            }
            
        } else if(method == "eth_sendTransaction"){

             
        }
       

        //console.log("text===>", text)

        return text
    }
    

    const _processWebMessage = async({
        origin="", 
        method, 
        params=[],
        permissionModal,

    }) => {
        try {

            permissionModal = toValue(permissionModal)

            console.log("method===>", method)
            console.log("params====>", params)
            console.log("getConnectedSites===>", await permission.getConnectedSites())

            if(origin.trim().length == 0){
                return Status.error("Invalid source origin")
                              .setCode(ErrorCodes.invalidRequest)
            }

 
            // firstly, lets check if user is connected
            if(!["eth_accounts",
                 "eth_requestAccounts",
                ].includes(method))
            {
                if(!(await permission.isSiteConnected(origin))) {
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

            let parsedTxData = null
            
            console.log("permissionModal====>", permissionModal)
            console.log("rpcMethodInfo===>", rpcMethodInfo)
            console.log("orign====>>>>", origin)

            if(method == "wallet_switchEthereumChain"){
                if(params.length == 0){
                    return Status.error("Invalid parameters")
                              .setCode(ErrorCodes.invalidParams)
                }

                let chainId = (params[0].toString().startsWith('0x')) 
                                ? parseInt(params[0], 16)
                                : parseInt(params[0])

                if(!(await netCore.exists(chainId))){
                    return Status.error("Network doesnt exist, kindly add it first")
                            .setCode(ErrorCodes.CHAIN_DOESNT_EXIST)
                }
            } 
        

            if(rpcMethodInfo.hasPermission){
                
                if(!(await permission.isSiteConnected(origin)) || 
                    rpcMethodInfo.askAlways == true
                ){

                    let text = rpcMethodInfo.template || ""

                    text = await processPermissionText({method, text, origin, txParams: params})

                    console.log("text", text)

                    let warning = rpcMethodInfo.warning || ""
                    let confirmBtn = rpcMethodInfo.confirmBtn || "Confirm"

                    let pResult =   await permissionModal.show({
                                        title: "Permission",
                                        method,
                                        text,
                                        warning,
                                        origin,
                                        confirmBtn
                                    })

                    //console.log("pResult====>", pResult)

                    if(!pResult.isConfirmed){
                        return Status.error("User rejected operation")
                    }

                    await permission.connectSite(origin)
               }

            }

            if(method == "wallet_addEthereumChain"){

                let resultStatus =  await netCore.wallet_addEthereumChain(params)

               // console.log("params=======>", params)
               // console.log("wallet_addEthereumChain===>", resultStatus)

                if(!resultStatus.isError()){

                    EventBus.emit("hideBrowser", true)

                    let { chainId, chainName } = params[0]

                    let popup = await Utils.showConfirmPopup({
                        text: `Switch your active network to ${chainName} (chainId: ${chainId})`
                    })

                    EventBus.emit("hideBrowser", false)

                    if(popup.isConfirmed){

                       let switchStatus = await netCore.setActiveNetwork(Utils.hexToInt(chainId))
                       
                       if(switchStatus.isError()) {
                            return switchStatus
                       }
                    }

                }

                return resultStatus;
            } else if (method == "wallet_switchEthereumChain") {
                return netCore.setActiveNetwork(parseInt(params[0], 16))
            }

            // lets login user in 
            let web3ConnStatus = await walletStore.getWeb3Conn()

            if(web3ConnStatus.isError()){
                return web3ConnStatus
            }

            let web3 = web3ConnStatus.getData()

            return web3.queryRPCMethod(method, params)

        } catch(e){
            Utils.logError("useBrowser#processWebMessage:", e)
            return Status.error("Failed to process data")
                         .setCode(ErrorCodes.PROCESSING_ERROR)
        }
    }

    const processWebMessage = async({
        webview, 
        dataObj, 
        permissionModal
    }) => {

        const { sourceOrigin="", message="" } = dataObj
        const msgObj = JSON.parse(message)
        
        const requestData = msgObj.requestData || {}
        const requestId = msgObj.requestId || ""

        const method = requestData["method"] || ""
        const params = requestData["params"] || []

        let resultStatus =  await  _processWebMessage({
                                origin: sourceOrigin, 
                                method, 
                                params,
                                permissionModal
                            })

        //console.log("resultStatus===>", resultStatus)

        /*if(resultStatus.isError()){
             Utils.toast(resultStatus.getMessage())
        }*/
        
        let finalMessage = {
            origin: sourceOrigin,
            requestId,
            method,
            msgType: "callback",
            data: resultStatus
        }

        console.log("finalMessage===>", finalMessage)

        webview.postMessage(JSON.stringify(finalMessage))

        if(["eth_accounts", "eth_requestAccounts",].includes(method) && 
            !resultStatus.isError()
        ){
            let activeNet = await netCore.getActiveNetworkInfo()
            emitWeb3Event(webview, "connect", { chainId: "0x"+parseInt(activeNet.chainId, 16) })
        }

    } //end func


    const emitWeb3Event = async (webview, eventName, eventData) => {
        
        let data = { eventName, eventData }

        let finalMessage = {
            origin: null,
            requestId: null,
            msgType: "event",
            data
        }

        webview.postMessage(JSON.stringify(finalMessage))
    }
    
    return {
        getInjectScript,
        processWebMessage,
        emitWeb3Event
    }
}
