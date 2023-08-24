<script setup>
import { inject, onBeforeMount, onMounted, ref } from 'vue';
import Utils from '../../classes/Utils';
import { useWalletStore } from '../../store/walletStore';
import { useNetworkStore  } from '../../store/networkStore';
import ModalSelect from './modal-select.vue';
import MicroModal from 'micromodal';  // es6 module

const walletStore = useWalletStore()
const initialized = ref(false)
const activeWalletInfo = ref({})
const pageError = ref("") 
const isPageLoading = ref(false)
const netInfo = ref(null)
const selectWalletModalId = ref("select-wallet-modal-"+Date.now())


const initialize = async () => {
    try {

        isPageLoading.value = true 

        activeWalletInfo.value = walletStore.getActiveWalletInfo()

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

onMounted(() => {
    window.setTimeout(() => {
        MicroModal.init()
    }, 1000)
})

</script>
<template>
    <button 
        class="btn btn-primary rounded-pill" 
        data-micromodal-trigger="selected-net-and-account"
    >   
        <div v-if="initialized" class="d-flex justify-content-center">
            <div>{{  Utils.maskAddress( walletStore.activeWalletFull ) }}</div>
            <div v-if="netInfo != null">
             |  {{ netInfo.nativeCurrency.symbol.toUpperCase() }}
            </div> 
        </div>
    </button>
    
    <div class="m_modal micromodal-slide" id="selected-net-and-account" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
            <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                <header class="modal__header">
                    <h2 class="modal__title" id="modal-1-title"></h2>
                    <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                </header>
                <main class="modal__content" id="modal-1-content">
                    <loading-view :isLoading="isPageLoading">
                        <div class="py-3 text-center hint text-muted" v-if="pageError != ''">
                            <div>{{ pageError }}</div>
                            <div>
                                <button @click.prevent="initialize" 
                                    class='btn btn-success btn-md px-4 py-2 rounded-pill mt-4'
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                        <div v-else class="pt-3 pb-2">
                            <div>
                                <div class="d-flex justify-content-between">
                                    <label class="fw-bold text-opacity-50">Wallet</label>
                                    <button class="btn btn-none text-info">Change</button>
                                </div>
                                <a href="#" 
                                    class="active-wallet-addr p-2 mt-2 border rounded d-flex justify-content-center align-items-center"
                                    @click.prevent
                                    :data-micromodal-trigger="selectWalletModalId"
                                >
                                    <div class="text-break">{{ walletStore.activeWalletFull }}</div>
                                    <button class="btn btn-primary p-2 rounded ms-2" >
                                        <Icon name='solar:copy-bold-duotone' :size="24" />
                                    </button>
                                </a>
                            </div>
                            
                           <div>
                                <network-select 
                                    @initialized="item => netInfo = item"
                                    @change="item => netInfo = item"
                                />
                           </div>
                            <div class="mt-5">
                                <button data-micromodal-close class="btn btn-primary full-width btn-lg rounded">
                                    Close
                                </button>
                            </div>
                        </div>
                    </loading-view>
                </main>
            </div>
        </div>
    </div>

    <ModalSelect 
        :id="selectWalletModalId"
        :options="selectItems"
        title="Select Wallet"
    />


</template>
<style lang="scss">
.active-wallet-addr {
    width: 100%;    
    height: 70px;
}
</style>