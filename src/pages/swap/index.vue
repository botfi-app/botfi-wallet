<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';

const initialized = ref(false)
const tokensCore = useTokens()
const userTokens = ref({})
const swapTokens = ref({})
const tokenA = ref()
const tokenB = ref()

onBeforeMount(() => {

})

const initialize = async () => {

    // lets fetch users assets 
    
}
</script>
<template>
    <WalletLayout
        title="Swap"
        :showNav="true"
        :hasNetSelect="true"
        :hasAddrSelect="true"
    >   
        <NativeBackBtn url="/wallet" />
        <div class="w-400 mb-5">
            <div id="swap">
                <div class="d-flex input-wrapper">
                    <div class="asset from">
                        <Image src=""
                    </div>
                </div>
            </div>
        </div>
    </WalletLayout>
</template>