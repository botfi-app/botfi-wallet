<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import TokenSelectorModal from '../../components/modals/TokenSelectorModal.vue';

const initialized = ref(false)
const isLoading = ref(false)
const errorMsg = ref("")

const tokenA = ref()
const tokenB = ref()

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    activeNetInfo.value = await networks.getActiveNetworkInfo()

    let params = { keyword: keyword.value, chainId: activeNetInfo.value.chainId }

    isLoading.value = true 

    
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
        <div class="w-400 mb-5" v-if="initialized">
            <div id="swap">
                <div class="d-flex input-wrapper">
                    <div class="asset from">
                        <Image src=""/>
                    </div>
                </div>
            </div>

            <TokenSelectorModal 
                :includeVerified="true"
                :includeUserTokens="true"
            />
        </div>
    </WalletLayout>
</template>