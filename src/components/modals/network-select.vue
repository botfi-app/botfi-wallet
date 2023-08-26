<script setup>
import { inject, onBeforeMount, onMounted, ref, toValue } from 'vue';
import { useNetworkStore  } from '../../store/networkStore';
import MicroModal from 'micromodal';  // es6 module
import Utils from '../../classes/Utils';
import { useWalletStore } from '../../store/walletStore';

const $emits = defineEmits(['initialized','change'])

const initialized = ref(false)
const activeNetInfo = ref({})
const selectNetworkModalId = ref("network-select-"+Date.now())
const networkSelectData = ref([])
const allNetworks = ref({})
const walletStore = useWalletStore()

const initialize = async () => {

    let userNetworks = await walletStore.getUserNetworks()    
    activeNetInfo.value = userNetworks.networks[userNetworks.default]
    allNetworks.value = userNetworks.networks

    $emits("change", activeNetInfo.value)

    processNetworkSelectData()

    initialized.value = true
}

onBeforeMount(() => {
    initialize()
})



const processNetworkSelectData = async () => {

    let allNets = allNetworks.value;

    if(Object(allNets).length == 0){
        return;
    }

    let processedData = []

    Object.keys(allNets).forEach((key) => {
        let item = allNets[key]
        if(!item) return;
        processedData.push({ 
            text:       item.chainName, 
            value:      item.chainId, 
            iconUrl:    Utils.getTokenIconUrl(item.symbol)
        })
    })

    networkSelectData.value = processedData
}

const handleOnNetSelect = async (item) => {
    let loader = Utils.loader("Changing Network")
    
    let resultStatus = await walletStore.setActiveNetwork(item.value)

    loader.close()

    if(resultStatus.isSuccess()){
        let _netInfo = allNetworks.value[item.value]
        activeNetInfo.value = _netInfo 
        $emits("change", _netInfo)
        return true
    }

    Utils.mAlert(resultStatus.getMessage())

    return false
}
</script>
<template>
    <div v-if="initialized">
        <div class="d-flex justify-content-between">
            <label class="fw-bold text-opacity-50">Network</label>
            <button class="btn btn-none text-info">Change</button>
        </div>
        <a href="#" 
            class="active-wallet-addr p-2 mt-2 border rounded d-flex justify-content-between  align-items-center"
            :data-micromodal-trigger="selectNetworkModalId"
            @click.prevent
        >
            <div class="text-break">
                {{ activeNetInfo.chainName }} ( {{ "0x" + parseInt(activeNetInfo.chainId, 16) }} )
            </div>
            <button class="btn btn-secondary p-2 rounded ms-2" >
                <img 
                    :width="26" 
                    :height="26" 
                    class="rounded"
                    :src="Utils.getTokenIconUrl(activeNetInfo.symbol)" 
                />
            </button>
        </a>
    </div>
    <modal-select 
        :id="selectNetworkModalId"
        :options="networkSelectData"
        title="Select Network"
        :selected="activeNetInfo.chainId"
        size="modal-sm"
        :onSelect="handleOnNetSelect"
        max-height="350px"
    />
</template>