/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, computed, toValue } from "vue"
import { useSimpleDB } from "./useSimpleDB"
import Wallet from "../classes/Wallet"
import Status from "../classes/Status"
import app from "../config/app"
import ErrorCodes from "../classes/ErrorCodes"
import Utils from "../classes/Utils"
import EventBus from "../classes/EventBus"
//import networks from "../../public/data/networks"

const $state = ref({
    isReady: false, 
    userActiveNetwork:      null,
    userNetworkInfo:        null,
    defaultNetworkInfo:     null
})

export const useNetworks = () => {
    
    const USER_NETWORKS = "_user_networks"

    const DB = useSimpleDB()
    const web3Conns = []


    onBeforeMount(async () => getUserNetworks())


    const activeNetwork   = computed(() =>  $state.value.userActiveNetwork )
    const allNetworks = computed(() => (
                            ($state.value.userNetworkInfo)
                            ? $state.value.userNetworkInfo.networks 
                            : {}
                        ))

    const isNetReady = computed(() => $state.value.isReady )

    const fetchDefaultNetworks = async (force=false) => {

        let $s = $state.value

        if(!force && $s.defaultNetworkInfo != null) {
            return $s.defaultNetworkInfo
        }

        let data =   (await import( /* @vite-ignore */
                       app.default_networks_url
                    )).default
           

        let networksObj = data.networks || {}

        for(let key in networksObj){

            if(!Utils.isValidUrl(networksObj[key].image)){
                networksObj[key].image = Utils.getTokenIconUrl(networksObj[key].image)
            }
            
            if(!Utils.isValidUrl(networksObj[key].nativeCurrency.image)){
                networksObj[key].nativeCurrency.image = Utils.getTokenIconUrl(networksObj[key].nativeCurrency.image)
            }
        }

        console.log(" data.networks====>",  data.networks)

        data.networks = networksObj
        
        $s.defaultNetworkInfo = data;

        return data 
    }

    const getUserNetworks = async () => {

        let $s  = $state.value

        if($s.userNetworkInfo != null) {
            return $s.userNetworkInfo
        }
        
        let defaultChains = await fetchDefaultNetworks(true)
        let userNetworkInfo = await DB.getItem(USER_NETWORKS) || {} 

        //console.log("userNetworkInfo===>", userNetworkInfo)
 
        if(Object.keys(userNetworkInfo).length == 0) {
            await DB.setItem(USER_NETWORKS, defaultChains)
        } else {

            let defaultChainNets = defaultChains.networks

            //console.log("defaultChain==>", defaultChainNets)

            // lets check if we have added new chains then we add it 
            for(let chainId in defaultChainNets){
                if(!(chainId in userNetworkInfo.networks)){
                    userNetworkInfo.networks[chainId] = defaultChainNets[chainId]
                }
            }
        }
        
        //console.log("userNetworkInfo===>", userNetworkInfo)

        $s.userNetworkInfo   = userNetworkInfo
        $s.userActiveNetwork = userNetworkInfo.networks[userNetworkInfo.default]
        $s.isReady = true 

        return userNetworkInfo
    }

    const getActiveNetworkInfo = async () => {
        await getUserNetworks()
        return toValue($state.value.userActiveNetwork)
    }

    const setActiveNetwork = async (chainId) => {

        //console.log("chainId===>", chainId)
        
        let $s = $state.value;
        let walletCore = new Wallet()

        let userNeworkInfo = await getUserNetworks()

        //console.log("userNeworkInfo===>", userNeworkInfo.networks)

        let netInfo = userNeworkInfo.networks[chainId] || null

        if(netInfo == null){
            return Status.error("Network not found")
        }

        /*let connectStatus = await walletCore.connect(netInfo)

        if(connectStatus.isError()) {
            return connectStatus
        }*/

        let connectStatus = await walletCore.ping(netInfo.rpcUrls[0])

        if(connectStatus.isError()) {
            return connectStatus
        }

        userNeworkInfo.default = chainId

        //console.log("userNeworkInfo===>", userNeworkInfo)

        await DB.setItem(USER_NETWORKS, userNeworkInfo)

        $s.userNetworkInfo = userNeworkInfo
        $s.userActiveNetwork =  netInfo

        EventBus.emit("chainChanged", netInfo)

        return Status.success()
    }


    const exists = async (chainId) => {
        return (chainId in (await getUserNetworks()))
    }

    const removeNetwork = async (chainId) => {

        let $s = $state.value;

        if(chainId == 1){
            return Status.error("Cannot delete this network")
        }

        let userNeworkInfo = await getUserNetworks()

        delete userNeworkInfo.networks[chainId]

        if(userNeworkInfo.default == chainId){
            userNeworkInfo.default = 1
        }

        await DB.setItem(USER_NETWORKS, userNeworkInfo)

        $s.userNetworkInfo = userNeworkInfo
        $s.userActiveNetwork =  userNeworkInfo.networks[userNeworkInfo.default]

        return Status.successData(userNeworkInfo)
    }

    const resetNetworks = async () => {
        
        let $s = $state.value;
        $s.userNetworkInfo = null;
        $s.userActiveNetwork = null


        await DB.removeItem( USER_NETWORKS )
    
        let userNetworkInfo = await fetchDefaultNetworks(true)
        
        await DB.setItem(USER_NETWORKS, userNetworkInfo)

        $s.userNetworkInfo = userNetworkInfo
        $s.userActiveNetwork =  userNetworkInfo.networks[userNetworkInfo.default]

        EventBus.emit("chainChanged", $s.userActiveNetwork)

        return Status.successData(userNetworkInfo)
    }

    const fetchNetworkInfo = async (rpc) => {

        let walletCore = new Wallet()


        let connectStatus = await walletCore.connect(
                                {rpcUrls: [rpc] }
                            )

        if(connectStatus.isError()) {
            return connectStatus
        }

        return walletCore.getNetwork()
    }

    const saveNetwork = async (netInfo, setDefault=false) => {

        netInfo = toValue(netInfo)

        if(!netInfo.icon || netInfo.icon == ""){
            if("iconUrls" in netInfo && Array.isArray(netInfo.iconUrls)) {
                if(netInfo.iconUrls.length > 0){
                    netInfo.icon = netInfo.iconUrls[0]
                }
            }
        }

        let $s = $state.value;

        let userNeworkInfo = await getUserNetworks()
        
        let chainId = parseInt(netInfo.chainId)

        userNeworkInfo.networks[chainId] = netInfo;

        if(setDefault){
            userNeworkInfo.default = chainId
            $s.userActiveNetwork = netInfo
        }

        await DB.setItem(USER_NETWORKS, userNeworkInfo)

        //console.log("userNeworkInfo===>", userNeworkInfo)

        $s.userNetworkInfo = userNeworkInfo

        return Status.success()
    }

    const wallet_addEthereumChain = async (params=[]) => {

        let invalidParamsErr = Status.error("Invalid params")
                                    .setCode(ErrorCodes.invalidParams)

        if(params.length == 0){
            return invalidParamsErr
        }

        let netInfo = params[0]

        let { chainId = "", chainName = "", rpcUrls = [], nativeCurrency = {}} = netInfo

        if(chainName.trim() == ""){
            return invalidParamsErr
        }
        
        if(!Array.isArray(rpcUrls)) return invalidParamsErr

        if(!rpcUrls[0].startsWith("https://") || !Utils.isValidUrl(rpcUrls[0])){
            return Status.error("Atleast 1 valid secure rpc url is required")
                         .setCode(ErrorCodes.SECURE_RPC_URL_REQUIRED)
        }

        let chainIdStr = chainId.toString()

        if(!chainIdStr.startsWith("0x") || chainIdStr == '0x'){
            return Status.error(`Invalid chain id hex value`)
                        .setCode(ErrorCodes.INVALID_CHAIN_ID_HEX_VALUE)
        }

        chainId = parseInt(chainIdStr,16)

        // native currency symbol
        let assetSymbol = (nativeCurrency.symbol || "").trim()

        if(assetSymbol == ""){
            return Status.error(`Expected 2-6 character string 'nativeCurrency.symbol'.`)
                        .setCode(ErrorCodes.INVALID_NATIVE_CURRENCY_SYMBOL)
        }

        let userNetworks = (await getUserNetworks()).networks || {}

        //console.log("userNetworks===>", userNetworks)

        if(chainId in userNetworks) return Status.success()

        let walletCore = new Wallet()

        let connectStatus = await walletCore.ping(rpcUrls[0])

        if(connectStatus.isError()) {
            return connectStatus
        }

        let iconUrls = netInfo.iconUrls || []

        if(iconUrls.length == 0){
            iconUrls.push(Utils.getTokenIconUrl(assetSymbol))
        }

        netInfo["chainId"] = chainId

        let resultStatus = await saveNetwork(netInfo)

        //console.log("saveNetwork====>", resultStatus)

        if(resultStatus.isError()) return resultStatus

        return Status.success()
    }

    const clearNetworks = async () => {
        await DB.removeItem(USER_NETWORKS)
    }


    const getWeb3Conn  = async (netInfo=null) => {

        if(!netInfo){
            netInfo = await getActiveNetworkInfo()
        }

        if(netInfo.chainId in web3Conns){
            return Status.successData(web3Conns[netInfo.chainId])
        }

        let walletCore = new Wallet()

        let connectStatus = await walletCore.connect(netInfo)

        if(connectStatus.isError()) {
            return connectStatus
        }

        let wInfo = connectStatus.getData()

        if(wInfo != null){
            web3Conns[netInfo.chainId] = wInfo
        }

        return Status.successData(wInfo)
    }

    const getExplorer = async (chainId, uri="") => {
       
        let nets = (await getUserNetworks()).networks || {}
        let netInfo = nets[chainId] || {}

        //console.log("netInfo====>", netInfo)

        let explorers = netInfo.blockExplorerUrls || []

        let exp;
        let isDefault;

        if(explorers.length == 0) {
            exp = app.default_explorer;
            isDefault = true
        } else {
            exp = explorers[0]
            isDefault = false
        }

        if(uri != ""){
            exp = `${exp}/${uri}?chainId=${chainId}`
        }

        return exp
    }

    return {
        isNetReady,
        getUserNetworks,
        getActiveNetworkInfo,
        fetchDefaultNetworks,
        setActiveNetwork,
        activeNetwork,
        allNetworks,
        removeNetwork,
        resetNetworks,
        fetchNetworkInfo,
        saveNetwork,
        wallet_addEthereumChain,
        clearNetworks,
        getWeb3Conn,
        getExplorer,
        exists
    }
 }