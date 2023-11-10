<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import TokenSelectorModal from '../../components/modals/TokenSelectorModal.vue';
import Utils from '../../classes/Utils';
import Image from '../../components/common/Image.vue';
import TokenSelectBtn from '../../components/swap/TokenSelectBtn.vue';

const initialized   = ref(false)
const isLoading     = ref(false)
const errorMsg      = ref("")
const tokensCore    = useTokens()
const networks      = useNetworks()
const netInfo       = ref()

const tokenA = ref(null)
const tokenB = ref(null)

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    netInfo.value = await networks.getActiveNetworkInfo()
    tokenA.value = await tokensCore.getTokenByAddr(Utils.nativeTokenAddr)

    initialized.value = true  
    
    //console.log("tokenA.value====>", tokenA.value)
}
</script>
<template>
    <WalletLayout
        title="Swap"
        :showNav="true"
        :hasNetSelect="true"
        :hasAddrSelect="true"
        :pageError="errorMsg"
    >   
        <NativeBackBtn url="/wallet" />

        <div class="w-400 mb-5 px-2">
            <div id="swap" class="mt-4">
                <TokenSelectBtn
                    :tokenInfo="tokenA"
                />
            </div>

            <TokenSelectorModal 
                :includeVerified="true"
                :includeUserTokens="true"
                @init=""
            />
        </div>
    </WalletLayout>
</template>