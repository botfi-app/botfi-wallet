<script setup>
import { inject, onBeforeMount, onMounted, ref } from 'vue';
import { useNetworkStore  } from '../../store/networkStore';
import MicroModal from 'micromodal';  // es6 module

const $emits = defineEmits(['initialized','change'])

const networkStore = useNetworkStore()
const activeNetInfo = ref({})
const selectNetworkModalId = ref("select-net-modal-"+Date.now())
const networkSelectData = ref([])


const initialize = async () => {

    let userNetworks = await networkStore.getUserNetworks()    
    activeNetInfo.value = userNetworks.networks[userNetworks.default]

    $emits("initialized", activeNetInfo.value)

    processNetworkSelectData(userNetworks.networks)   
}

onBeforeMount(() => {
    initialize()
})

onMounted(() => {
    window.setTimeout(() => {
        MicroModal.init()
    }, 1000)
})

const processNetworkSelectData = async (allNets) => {

    if(Object(allNets).length == 0){
        return;
    }

    let processedData = []

    Object.keys(allNets).forEach((key) => {
        let item = allNets[key]
        processedData.push({ 
            text:       item.chainName, 
            value:      item.chainId, 
            logoUrl:    Utils.getTokenIconUrl(netInfo.nativeCurrency.symbol)
        })
    })

    networkSelectData.value = processedData
}
</script>
<template>
    <div>
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
                {{ netInfo.chainName }} ( {{ "0x" + parseInt(activeNetInfo.chainId, 16) }} )
            </div>
            <button class="btn btn-secondary p-2 rounded ms-2" >
                <img 
                    :width="26" 
                    :height="26" 
                    class="rounded"
                    :src="Utils.getTokenIconUrl(activeNetInfo.nativeCurrency.symbol)" 
                />
            </button>
        </a>
    </div>
    <ModalSelect 
        :id="selectNetworkModalId"
        :options="networkSelectData"
        title="Select Network"
    />
</template>