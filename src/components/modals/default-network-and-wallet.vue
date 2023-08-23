<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import { useWalletStore } from '../../store/walletStore';
import { useSettingStore  } from '../../store/settingStore';
import ModalSelect from './modal-select.vue';

const walletStore = useWalletStore()
const initialized = ref(false)
const activeWalletInfo = ref({})
const settingStore = useSettingStore()
const pageError = ref("") 
const isPageLoading = ref(false)
const defaultNetInfo = ref({})
const networks = ref({})

const initialize = async () => {
    try {

        isPageLoading.value = true 

        activeWalletInfo.value = walletStore.getActiveWalletInfo()

        let netInfoStatus = await settingStore.getNetworkInfo()

        if(netInfoStatus.isError()){
            return pageError.value = netInfoStatus.getMessage()
        }

        let netInfo = netInfoStatus.getData()

        //console.log("networksInfo===>", netInfoStatus)

        let defaultNetId = netInfo.default; 
        let allNetworks = netInfo.networks;

        defaultNetInfo.value =  allNetworks[defaultNetId]
        networks.value = allNetworks

        ///console.log("defaultNetInfo.value===>", defaultNetInfo.value)
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
        v-if="initialized"
        data-bs-toggle="modal" 
        data-bs-target="#netAndAcctModal"
    >
        {{  Utils.maskAddress( walletStore.activeWalletFull ) }}  | 
        {{ defaultNetInfo.nativeCurrency.symbol.toUpperCase() }}
    </button>
    
    <ModalSelect 
        
    />
    <div class="modal"  
        data-bs-backdrop="static" 
        id="netAndAcctModal" 
        tabindex="-1"
    >
        <div class="modal-dialog dialog-sm">
            <div class="modal-content rounded-lg mt-10">

                <div class="d-flex justify-content-between modal-top-btn">
                    <div>&nbsp;</div>
                    <a href="#" @click.prevent class="close-btn" data-bs-dismiss="modal">
                        <Icon name="uiw:close" :size="18" />
                    </a>
                </div>

                <div class="modal-body shadow">
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
                                <div class="active-wallet-addr p-2 mt-2 border rounded d-flex justify-content-center align-items-center">
                                    <div class="text-break">{{ walletStore.activeWalletFull }}</div>
                                    <button class="btn btn-primary p-2 rounded ms-2" >
                                        <Icon name='solar:copy-bold-duotone' :size="24" />
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <div class="d-flex justify-content-between">
                                    <label class="fw-bold text-opacity-50">Network</label>
                                    <button class="btn btn-none text-info">Change</button>
                                </div>
                                <div class="active-wallet-addr p-2 mt-2 border rounded d-flex justify-content-between  align-items-center">
                                    <div class="text-break">
                                        {{ defaultNetInfo.chainName }} ( {{ "0x" + parseInt(defaultNetInfo.chainId, 16) }} )
                                    </div>
                                    <button class="btn btn-secondary p-2 rounded ms-2" >
                                        <img 
                                            :width="26" 
                                            :height="26" 
                                            class="rounded"
                                            :src="Utils.getTokenIconUrl(defaultNetInfo.nativeCurrency.symbol)" 
                                        />
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mt-5">
                                <button data-bs-dismiss="modal" class="btn btn-primary full-width btn-lg rounded">
                                    Close
                                </button>
                            </div>
                        </div>
                    </loading-view>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.active-wallet-addr {
    width: 100%;    
    height: 70px;
}
</style>