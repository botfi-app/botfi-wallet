<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';

const { getERCTokenAllowance } = useTokens()

const p =   defineProps({
                contract:  { type: String, required: true },
                amountToSpend: { type: Number, required: true }, 
                allowance: { type: null, default: null },
                spender: { type: String, required: true },
                owner: { type: String, required: true },
            })

const emits = ref(["approved"])
const allowance = ref(p)

onBeforeMount(() => {
    initiate()
})

const initiate = async () => {

    let allwn = allowance.value

    if(allwn == null){
        await getAllowance()
    }

    if(allwn >= p.amountToSpend){
        return emits("approved")
    }
}

const getAllowance = async () => {
    try {

        let tokenInfo = getERC20TokenInfo({ 
            contract: p.contract,
            
        })
    } catch(e){

    }
}
</script>
<template>

</template>