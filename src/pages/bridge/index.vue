<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { nextTick, onBeforeMount, onMounted, ref } from 'vue';
import { AxelarAssetTransfer, Environment, loadAssets, loadChains } from "@axelar-network/axelarjs-sdk";
import Utils from '../../classes/Utils';
import axelarChainIdsMap from '../../config/bridge/axelar_chainid_map'
import BridgeChainSelector from '../../components/modals/BridgeChainSelector.vue';

const axlConfig = {
    environment: Environment.MAINNET 
}

//console.log("axlConfig===>", axlConfig)

const initialized   = ref(false)
const pageError = ref("")
const axlChains = ref(null)

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try {

        await fetchAxlChains() 

    } catch(e){
        Utils.logError(`bridge#initialize:`,e)
        pageError.value = Utils.generalErrorMsg
    } finally {
        initialized.value = true 
    }
}

const fetchAxlChains = async () => {
    
    if(axlChains.value != null) return;

    let axlChainsDataArr = await loadChains(axlConfig)

    let _axlChains = []

    // lets filter we want out 
    for(let dataObj of axlChainsDataArr){
        if(!(dataObj.module == 'evm')) continue
        dataObj.chainId = axelarChainIdsMap[dataObj.id]
        _axlChains.push(dataObj)
    }

    //console.log("_axlChains====>", _axlChains)

    axlChains.value = _axlChains
}
</script>
 
<template>
    <WalletLayout
        title="Bridge"
        :showNav="true"
        :hasNetSelect="true"
        :hasAddrSelect="true"
        :pageError="pageError"
        :isLoading="!initialized"
        :hasFooter="true"
        backUrl="/wallet"
    >

        <div>
            <div class="d-flex">
                <div>
                    <BridgeChainSelector 
                        :chains="axlChains"
                        title="Source"
                        
                    />
                </div>
            </div>
        </div>
    </WalletLayout>
</template>