<script setup>

import { useRouter } from 'vue-router';
import { useTokens } from '../../composables/useTokens';
import TokenList from '../../components/wallet/TokenList.vue';
import { onBeforeMount, ref } from 'vue'
import { Modal as bsModal } from 'bootstrap'
import Utils from '../../classes/Utils';
import AddTokenModal from '../../components/modals/AddToken.vue';
import DefaultNetAndWallet from '../../components/modals/DefaultNetAndWallet.vue';


const router = useRouter()
const isLoading     = ref(false)
const dataState     = ref(Date.now())
const dataToRender  = ref(null)
const tokensInst    = useTokens()
const tokensArr     = ref([])
const addTokenModalId = ref(`add-token-modal-${Date.now()}`)

onBeforeMount(() => {
    initialize()
})

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

const initialize = async () => {
   tokensArr.value = tokensInst.getTokens(null)
}
</script>
<template>
    <WalletLayout
        title="Tokens"
        :show-nav="false"
    >   

        <NativeBackBtn />

        <AddTokenModal
            :id="addTokenModalId"
            @success="dataState = Date.now()"
        />

        <div class="w-400 mb-5">
            
            <loading-view :isLoading="isLoading" :key="dataState">
                <div class="d-flex p-2 align-items-center flex-nowrap">
                    <div class="fw-semibold fs-6 pe-2">Tokens</div>
                    <div class="flex-grow-1">
                        <search-form 
                            placeholder="Search"
                            @change="onSearch"
                            :dataToFilter="tokensArr"
                            :filterKeys="['name', 'address', 'symbol']"
                            :mode="{start: true, end: true }"
                            :key="tokensArr.length"
                        />
                    </div>
                    <div class="ps-2">
                        <DefaultNetAndWallet 
                            :showAddr="false"
                            net-max-width="70px"
                        />
                    </div>
                </div>
                <TokenList />
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
