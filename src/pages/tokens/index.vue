<script setup>

import { onBeforeMount, ref } from 'vue'
//import Utils from '../../classes/Utils';
import EventBus from '../../classes/EventBus';
import TokensAndActivityTabs from '../../components/wallet/TokensAndActivityTabs.vue';


onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
   EventBus.emit("update-balance")
}
</script>
<template>
    <WalletLayout
        title="Tokens"
        :showNav="true"
        :hasNetSelect="true"
        :hasAddrSelect="true"
    >   
        <NativeBackBtn 
            url="/wallet"
        />
        
        <div class="w-400 mb-5">
            <div class="mt-3 mx-2">
                <TokensAndActivityTabs 
                    :limit="null"
                />
            </div>
        </div>
    </WalletLayout>
</template>
