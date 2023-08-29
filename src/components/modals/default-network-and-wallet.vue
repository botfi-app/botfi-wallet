<script setup>
import { inject, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import Utils from '../../classes/Utils';
import { useWalletStore } from '../../store/walletStore';
import modal from './modal.vue';

const walletStore = useWalletStore()
const initialized = ref(false)
const activeWalletInfo = ref({})
const pageError = ref("") 
const isPageLoading = ref(false)
const modalId = ref("d-net-acct-modal"+Date.now())

const initialize = async () => {
    try {

        isPageLoading.value = true 

        activeWalletInfo.value = walletStore.getActiveWalletInfo()
        await walletStore.getUserNetworks()

    } catch(e){
        pageError.value = Utils.generalErrorMsg
        Utils.logError('default-loading-and-wallet#initialize:', e)
    } finally {
        isPageLoading.value = false 
        initialized.value = true 
    }
}

onBeforeMount(() => {
    initialize()
})

</script>
<template>
    <button 
        class="btn btn-primary rounded-pill fs-14" 
        :data-micromodal-trigger="modalId"
        data-bs-toggle="modal" 
        :data-bs-target="`#${modalId}`"
    >   
        <div v-if="initialized"
            class="d-flex justify-content-center align-items-center flex-nowrap"
        >
            <div>{{  Utils.maskAddress( walletStore.activeWalletFull ) }}</div>
            <div v-if="walletStore.userActiveNetwork != null" class="d-flex flex-nowrap align-items-center">
                <div class="px-1">|</div>
                <div style="max-width: 65px" class="text-truncate">
                    {{ walletStore.userActiveNetwork.name }}
                </div>
            </div> 
        </div>
    </button>
    <modal
        :id="modalId"
        title=""
        :has-header="false"
        :has-footer="false"
    >
        <template #body>
            <loading-view :isLoading="isPageLoading">
                <div class="py-3">
                    <div class="p-3 text-center hint text-muted" v-if="pageError != ''">
                        <div>{{ pageError }}</div>
                        <div>
                            <button @click.prevent="initialize" 
                                class='btn btn-success btn-md px-4 py-2 rounded-pill mt-4'
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                    <div v-else class="p-3 pb-2">
                        <div>
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="fw-bold text-opacity-50">Wallet</label>
                                <button class="btn btn-none text-primary">Change</button>
                            </div>
                            <a href="#" 
                                class="active-wallet-addr p-2 mt-2 border rounded d-flex justify-content-center align-items-center no-underline"
                                @click.prevent
                            >
                                <div class="text-break">{{ walletStore.activeWalletFull }}</div>
                                <button class="btn btn-primary p-2 rounded ms-2" >
                                    <Icon name='solar:copy-bold-duotone' :size="24" />
                                </button>
                            </a>
                        </div>
                        <div class="mt-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="fw-bold text-opacity-50">Network</label>
                                <router-link  
                                    :to="`/networks?r=${Utils.getUriPath()}`" 
                                    class="btn btn-none text-primary"
                                >
                                    Change
                                </router-link>
                            </div>
                            <router-link
                                class="active-wallet-addr p-2 mt-2 border rounded d-flex justify-content-between  align-items-center no-underline"
                                v-if="walletStore.userActiveNetwork != null"
                                :to="`/networks?r=${Utils.getUriPath()}`"
                            >
                                <div class="text-break">
                                    {{ walletStore.userActiveNetwork.name }} ( {{ walletStore.userActiveNetwork.chainId }} )
                                </div>
                                <button class="btn btn-secondary p-2 rounded ms-2" >
                                    <Image 
                                        :width="26" 
                                        :height="26" 
                                        class="rounded-circle"
                                        :src="walletStore.userActiveNetwork.icon" 
                                        :placeholder="walletStore.userActiveNetwork.name"
                                    />
                                </button>
                            </router-link>
                        </div>
                        <div class="mt-4">
                            <button data-bs-dismiss="modal" class="btn btn-primary full-width rounded-pill">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </loading-view>
        </template>
    </modal>
</template>
<style lang="scss">
.active-wallet-addr {
    width: 100%;    
    height: 70px;
}
</style>