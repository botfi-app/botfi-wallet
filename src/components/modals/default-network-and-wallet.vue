<script setup>
import { inject, onBeforeMount, onMounted, ref } from 'vue';
import Utils from '../../classes/Utils';
import { useWalletStore } from '../../store/walletStore';
import { useNetworkStore  } from '../../store/networkStore';
import ModalSelect from './modal-select.vue';
import MicroModal from 'micromodal';  // es6 module
import modal from './modal.vue';

const walletStore = useWalletStore()
const initialized = ref(false)
const activeWalletInfo = ref({})
const pageError = ref("") 
const isPageLoading = ref(false)
const netInfo = ref(null)
const modalId = ref("d-net-acct-modal"+Date.now())
const selectWalletModalId = ref("lol")

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
</script>
<template>
    <button 
        class="btn btn-primary rounded-pill" 
        :data-micromodal-trigger="modalId"
    >   
        <div v-if="initialized" class="d-flex justify-content-center align-items-center text-sm">
            <div>{{  Utils.maskAddress( walletStore.activeWalletFull ) }}</div>
            <div v-if="netInfo != null"><span class="px-1">|</span>{{ netInfo.symbol }}</div> 
        </div>
    </button>
    <modal
        :id="modalId"
        title=""
    >
        <loading-view :isLoading="isPageLoading">
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
                
                <div class="mt-4">
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
    </modal>

</template>
<style lang="scss">
.active-wallet-addr {
    width: 100%;    
    height: 70px;
}
</style>