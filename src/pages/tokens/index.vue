<script setup>

import { useRouter } from 'vue-router';
import TokenBalances from '../../components/wallet/TokenBalances.vue';
import { onBeforeMount, ref } from 'vue'
import { Modal as bsModal } from 'bootstrap'
import Utils from '../../classes/Utils';
import AddTokenModal from '../../components/modals/AddToken.vue';
import EventBus from '../../classes/EventBus';


const router = useRouter()
const isLoading     = ref(false)
const dataState     = ref(Date.now())
const addTokenModalId = ref(`add-token-modal-${Date.now()}`)

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

        <AddTokenModal
            :id="addTokenModalId"
            @success="dataState = Date.now()"
        />

        <div class="w-400 mb-5">
            
            <loading-view :isLoading="isLoading" :key="dataState">
                <TokenBalances
                    :limit="null"
                    :hasSearch="true"
                />
            </loading-view>
            <div>
                <MainBtn 
                    text="Import Token"
                    :onClick="()=> router.push('/tokens/import')"
                />
            </div>
        </div>
    </WalletLayout>
</template>
