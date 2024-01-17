<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { nextTick, onBeforeMount, onMounted, ref } from 'vue';
import { AxelarAssetTransfer, Environment, loadAssets } from "@axelar-network/axelarjs-sdk";

const axlConfig = {

}

const initialized   = ref(false)
const pageError = ref("")

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
    
    </WalletLayout>
</template>