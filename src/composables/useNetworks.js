/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { onBeforeMount, ref, computed, toValue } from "vue"
import { useSimpleDB } from "./useSimpleDB"
import Wallet from "../classes/Wallet"
import Status from "../classes/Status"

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

        let results = await import(`/data/networks.js?url=1&r=${Date.now()}`)
           
        let data = results.default;

        $s.defaultNetworkInfo = data;

        return data
    }

    const getUserNetworks = async () => {

        let $s  = $state.value

        if($s.userNetworkInfo != null) {
            return $s.userNetworkInfo
        }
       
        let userNetworkInfo = await DB.getItem(USER_NETWORKS) 

        if(userNetworkInfo == null) {
            userNetworkInfo = await fetchDefaultNetworks(true)
            await DB.setItem(USER_NETWORKS, userNetworkInfo)
        }

        //console.log("userNetworkInfo===>", userNetworkInfo)

        $s.userNetworkInfo   = userNetworkInfo
        $s.userActiveNetwork = userNetworkInfo.networks[userNetworkInfo.default]
        $s.isReady = true 

        return userNetworkInfo
    }

    const getActiveNetworkInfo = async () => {
        await getUserNetworks()
        return toValue(activeNetwork)
    }

    const setActiveNetwork = async (chainId) => {
        
        let $s = $state.value;
        let walletCore = new Wallet()

        let userNeworkInfo = await getUserNetworks()

        let netInfo = userNeworkInfo.networks[chainId]

        //console.log("netInfo===>", netInfo)

        let connectStatus = await walletCore.connect(netInfo)

        if(connectStatus.isError()) {
            return connectStatus
        }

        userNeworkInfo.default = chainId

        //console.log("userNeworkInfo===>", userNeworkInfo)

        await DB.setItem(USER_NETWORKS, userNeworkInfo)

        $s.userNetworkInfo = userNeworkInfo
        $s.userActiveNetwork =  netInfo

        return Status.success()
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

        return Status.successData(userNetworkInfo)
    }

    const fetchNetworkInfo = async (rpc) => {

        let walletCore = new Wallet()


        let connectStatus = await walletCore.connect(
                                {rpc: [rpc] }
                            )

        if(connectStatus.isError()) {
            return connectStatus
        }

        return walletCore.getNetwork()
    }

    const saveNetwork = async (netInfo, setDefault=false) => {

        netInfo = toValue(netInfo)

        let $s = $state.value;

        let userNeworkInfo = await getUserNetworks()
        
        let chainId = parseInt(netInfo.chainId)

        userNeworkInfo.networks[chainId] = netInfo;

        if(setDefault){
            userNeworkInfo.default = chainId
            $s.userActiveNetwork = netInfo
        }

        await DB.setItem(USER_NETWORKS, userNeworkInfo)

        $s.userNetworkInfo = userNeworkInfo

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
        let netInfo = nets[chainId]

        let explorers = netInfo.explorers || []

        if(explorers.length == 0) {
            return ""
        }

        let exp = explorers[0]

        if(uri != ""){
            exp = `${exp}/${uri}`
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
        clearNetworks,
        getWeb3Conn,
        getExplorer
    }
 }