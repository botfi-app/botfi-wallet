<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import Utils from '../../classes/Utils';

const { getERC20TokenInfo } = useTokens()

const p =   defineProps({
                contract:  { type: String, required: true },
                amountToSpend: { type: Number, required: true }, 
                allowance: { type: null, default: null },
                spender: { type: String, required: true },
                wallet: { type: String, required: true },
            })

const emits = ref(["hasApproved"])
const allowance = ref(p)
const isLoading = ref(false)
const errorMsg = ref("")

onBeforeMount(() => {
    initiate()
})

const initiate = async () => {

    errorMsg.value = ""
    let allwn = allowance.value

    if(allwn == null){
        await getAllowance()
    }

    if(allwn >= p.amountToSpend){
        return emits("hasApproved", false)
    }
}

const getAllowance = async () => {
    try {

        errorMsg.value = ""

        isLoading.value = true

        let tokenInfoStatus = await getERC20TokenInfo(
                            p.contract,
                            p.wallet,
                            p.spender
                        )

        if(tokenInfoStatus.isError()){
            return errorMsg.value = tokenInfoStatus.getMessage()
        }

        let tokenInfoObj = tokenInfoStatus.getData() || {}

        
    } catch(e){
        Utils.logError("TokenApproveBtn#getAllowance", e)
        emits("hasApproved", false)
    } finally {
        isLoading.value = false
    }
}
</script>
<template>

</template>