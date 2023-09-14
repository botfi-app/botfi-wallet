<script setup>

import { useRouter } from 'vue-router';
import { useTokens } from '../../composables/useTokens';
import TokenList from '../../components/wallet/TokenList.vue';
import { onBeforeMount, ref } from 'vue'
import { Modal as bsModal } from 'bootstrap'
import Utils from '../../classes/Utils';
import AddTokenModal from '../../components/modals/AddToken.vue';


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
        title="Wallet Addresses"
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
                        <button class="btn btn-primary rounded-pill v-center"
                            data-bs-toggle="modal" 
                            :data-bs-target="`#${addTokenModalId}`"
                        >
                            <Icon name="ion:add-sharp" :size="18" />
                            <div class="px-1">Add</div>
                        </button>
                    </div>
                </div>
                <TokenList />
            </loading-view>
        </div>
    </WalletLayout>
</template>
