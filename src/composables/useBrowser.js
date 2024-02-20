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
import { useTokens } from "./useTokens"
import { useNFT } from "./useNFT"


export const useBrowser = () => {

    const permission  = usePermission()
    const walletStore = useWalletStore()
    const netCore     = useNetworks()
    const txCore      = useTx()
    const tokenCore   = useTokens()
    const nftCore     = useNFT()

    const { activeWallet } = walletStore

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

        let loader = null

        try {

            permissionModal = toValue(permissionModal)

            console.log("method===>", method)
            console.log("params====>", params)
            console.log("getConnectedSites===>", await permission.getConnectedSites())

            if(origin.trim().length == 0){
                return Status.error("Invalid source origin")
                              .setCode(ErrorCodes.invalidRequest)
            }

            let isSiteConneted = await permission.isSiteConnected(origin)

            // firstly, lets check if user is connected
            if(!["eth_accounts",
                 "eth_requestAccounts",
                 "wallet_watchAsset",
                 "net_version"   
                ].includes(method))
            {
                if(!isSiteConneted) {
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
                
                if(!isSiteConneted || rpcMethodInfo.askAlways == true){

                    EventBus.emit("hideBrowser", true)

                    let text = rpcMethodInfo.template || ""

                    text = await processPermissionText({method, text, origin, params})

                    //console.log("text", text)

                    let warning = rpcMethodInfo.warning || ""
                    let confirmBtn = rpcMethodInfo.confirmBtn || "Confirm"

                    let pResult =   await permissionModal.show({
                                        title: "Permission",
                                        method,
                                        text,
                                        warning,
                                        origin,
                                        confirmBtn,
                                        requestParams: params
                                    })

                    EventBus.emit("hideBrowser", false)

                    if(!pResult.isConfirmed){
                        return Status.error("User rejected request")
                                .setCode(ErrorCodes.userRejectedRequest)
                    }

                    if(!isSiteConneted){
                        await permission.connectSite(origin)
                    }

                    // if the request is eth_sendTransaction, then lets retrieve
                    // the tx params again, the gas params might have been changed
                    //params = pResult.requestParams || []

                   // console.log("requestParams===>", params)
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
            else if (method == "wallet_watchAsset") { 

                let dataObj = params[0] || {}

                let type = (dataObj.type || "").toLowerCase()
                let opts = dataObj.options || {}

                if(!["erc20", "erc721", "erc1155"].includes(type)){
                    return Status.error("a valid asset type is required.")
                                 .setCode(ErrorCodes.INVALID_ASSET_TYPE)
                }

                let contract = opts.address;

                EventBus.emit("hideBrowser", true)

                let activeNet = await netCore.getActiveNetworkInfo()
                let wallet = activeWallet.address
                let resultStatus; 

                if(type == "erc20"){
                    resultStatus = await tokenCore.processImportERC20Token({ 
                                            contract,
                                            wallet,
                                            chainId: activeNet.chainId
                                        })
                    
                } else if(["erc721", "erc1155"].includes(type)) {

                    let tokenId = (opts.tokenId || "").toString().trim();

                    if(tokenId == ""){
                        return Status.error("A valid tokenId is required")
                                     .setCode(ErrorCodes.TOKEN_ERRORS)
                    }

                    resultStatus = await nftCore.processImportNFT({
                                        wallet,
                                        standard: type,
                                        contract,
                                        tokenId
                                    })
                }

                if(resultStatus.isError()) return resultStatus

                return Status.successData(true)
            }   //end if watch asset 

            // lets login user in 
            let web3ConnStatus = await walletStore.getWeb3Conn()

            if(web3ConnStatus.isError()){
                return web3ConnStatus
            }

            let web3 = web3ConnStatus.getData()

            if(["eth_sendTransaction"].includes(method)){
                EventBus.emit("hideBrowser", true)
                loader = Utils.loader("Processing Request")
            }

            let rpcResultStatus = await  web3.queryRPCMethod(method, params)

            return rpcResultStatus
        } catch(e){
            Utils.logError("useBrowser#processWebMessage:", e)
            return Status.error("Internal error")
                         .setCode(ErrorCodes.internal)
        } finally {
            if(loader) loader.close()
            EventBus.emit("hideBrowser", false)
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
            emitWeb3Event(webview, "connect", { chainId: Utils.toHex(activeNet.chainId) })
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

