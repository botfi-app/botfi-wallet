<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import TokenSelectorModal from '../../components/modals/TokenSelectorModal.vue';
import Utils from '../../classes/Utils';
import Image from '../../components/common/Image.vue';
import TokenSelectBtn from '../../components/swap/TokenSelectBtn.vue';
import { Modal as bsModal } from 'bootstrap';

const initialized   = ref(false)
const isLoading     = ref(false)
const errorMsg      = ref("")
const tokensCore    = useTokens()
const networks      = useNetworks()
const netInfo       = ref()

const tokenA = ref(null)
const tokenB = ref(null)

const activeTokenVarName = ref("tokenA")

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    netInfo.value = await networks.getActiveNetworkInfo()
    tokenA.value = await tokensCore.getTokenByAddr(Utils.nativeTokenAddr)

    initialized.value = true  
    
    //console.log("tokenA.value====>", tokenA.value)
}

const openTokenSelectModal = (tokenVarName) => {
    activeTokenVarName.value = tokenVarName
    bsModal.getInstance("#token-selector-modal").show()
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

        <div  class="swap-engine w-400 mb-5 px-2">
            <div  class="mt-4 token-a">
                <TokenSelectBtn
                    :tokenInfo="tokenA"
                    :isFocused="true"
                    @open-token-select-modal="openTokenSelectModal('token_a')"
                />
            </div>
            <div class="center-vh w-full flip-btn-parent">
                <a href="#" 
                   @click.prevent 
                   class="flip-btn center-vh rounded-lg"
                >
                    <Icon name="gg:arrows-exchange-alt-v" :size="24" />
                </a>
            </div>
            <div  class="token-b">
                <TokenSelectBtn
                    :tokenInfo="tokenB"
                    @open-token-select-modal="openTokenSelectModal('token_b')"
                />
            </div>

            <TokenSelectorModal 
                :includeVerified="true"
                :includeUserTokens="true"
            />
        </div>
    </WalletLayout>
</template>