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
import supportedChains from "../config/swap/supported_chains.json"
import { useNetwork } from '@vueuse/core';

const $state = ref({
    isSupported: false,
    routers: {}
})

export const useSwap =  () => {

    const networks = useNetworks()
    const netInfo = ref()

    const isSupported = computed(()=> $state.value.isSupported )

    onBeforeMount(() => {
        initialize()
    })

    const initialize = async () => {
        
        let net = await networks.getActiveNetworkInfo()

        $state.value.isSupported = ( net.chainId in supportedChains && 
                                     supportedChains[net.chainId] == true 
                                    )
    }


    return {
        isSupported
    }
}
    