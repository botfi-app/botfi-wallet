/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import {ref, inject, computed, onBeforeMount, onBeforeUnmount } from 'vue'
import { useDB } from "./useDB"
import Status from '../classes/Status';
import Utils from '../classes/Utils';
import { useNetworks } from "./useNetworks"
import EventBus from '../classes/EventBus';
import swapConfig from "../config/swap"
import { useNetwork } from '@vueuse/core';

const supportedChains = swapConfig.supported_chains;
const $state = ref({
    isSupported: false,
    routes: {},
    contractsInfo: {}
})

export const useSwap =  () => {

    const networks = useNetworks()
    const netInfo = ref()

    const isSupported = computed(()=> $state.value.isSupported )
    const routes = computed(() => $state.value.routes)
    const contractsInfo = computed(() => $state.value.contractsInfo)

    onBeforeMount(() => {
        initialize()
    })

    const initialize = async () => {
        await isChainSupported()
    }

    const isChainSupported = async () => {
        
        let net = await networks.getActiveNetworkInfo()

        $state.value.isSupported = ( net.chainId in supportedChains && 
                                     supportedChains[net.chainId] == true 
                                    )
        return $state.value.isSupported
    }

    const getWeb3 = async () => {
          
        let web3Status = await networks.getWeb3Conn()

        if(web3Status.isError()){
            Utils.logError("useSwap#getWeb3", web3Status.getMessage())
            return null
        }

        return web3Status.getData()
    }

    // fetch the routes 
    const getRoutes = async (web3 = null) => {

        let net = await networks.getActiveNetworkInfo()
        
        let curRoutes = routes.value[net.chainId] || null

        if(curRoutes != null) {
            return Status.successData(curRoutes)
        }

        if(web3 == null) web3 = await getWeb3()

        let contractsInfo =  await web3.getSystemContracts()

        console.log("contractsInfo===>", contractsInfo)
        
        let swapContract = contractsInfo.swap.factory;

        console.log("swapFactory==>", swapContract)

        let results = swapContract.getAllRoutes() 

        console.log("results==>", results)

        return Status.successData()
    }

    return {
        isSupported,
        isChainSupported,
        routes,
        getRoutes
    }
}
    