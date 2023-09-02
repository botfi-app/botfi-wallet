<script setup>

import { useRouter } from 'vue-router';
import { useWalletStore } from '../../store/walletStore';

const walletStore = useWalletStore()
const router = useRouter()
const initialized = ref(false)
const isLoading   = ref(false)
const modalTitle  = ref("")
const selectedItem = ref(null) 
const modalId = ref('address-modal-'+Date.now())
const dataState = ref(Date.now())

</script>
<template>
    <WalletLayout
        title="Wallet Addresses"
        :show-nav="false"
    >   

        <NativeBackBtn />

        <div class="w-400 mb-5">
            
            <loading-view :isLoading="isLoading" :key="dataState">
                <div class="d-flex p-2 align-items-center flex-nowrap">
                    <div class="fw-semibold fs-6 pe-2">Wallets</div>
                    <div class="flex-grow-1">
                        <search-form 
                            placeholder="Search"
                            @change="onSearch"
                            :dataToFilter="walletStore.wallets"
                            :filterKeys="['name', 'address']"
                        />
                    </div>
                    <div class="ps-2">
                        <router-link to="/networks/add" class="no-underline">
                            <button class="btn btn-primary rounded-pill v-center">
                                <Icon name="ion:add-sharp" :size="18" />
                                <div class="px-1">Add</div>
                            </button>
                        </router-link>
                    </div>
                </div>

            </loading-view>
        </div>
    </WalletLayout>
</template>