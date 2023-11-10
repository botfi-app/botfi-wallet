<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import Utils from '../../classes/Utils';

const props = defineProps({
                includeUserTokens: { type: Boolean, default: true },
                includeAllVerified: { type: Boolean, default: true },        
            })

const networks  = useNetworks()
const tokensCore = useTokens()
const userTokens = ref({})
const swapTokens = ref({})
const errorMsg = ref("")
const id = ref("token-selector-modal")

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try {

        activeNetInfo.value = await networks.getActiveNetworkInfo()

        let params = { keyword: keyword.value, chainId: activeNetInfo.value.chainId }

        isLoading.value = true 

        let resultStatus = await Http.getApi("/tokens/verified", params)

        if(resultStatus.isError()){
            errorMsg.value = resultStatus.getMessage()
            return false;
        }

        console.log("")
    } catch(e){
        errorMsg.value = Utils.generalErrorMsg
        Utils.logError("TokenSelectorModal#initialize:", e)
    }
}
</script>
<template>
    <Modal
        :id="id"
        title="Select Token"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
    >
        <template #body>

        </template>
    </Modal>
</template>