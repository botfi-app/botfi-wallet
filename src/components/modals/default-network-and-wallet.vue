<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import { useWalletStore } from '../../store/walletStore';

const walletStore = useWalletStore()
const initialized = ref(false)
const activeWalletInfo = ref({})


const initialize = () => {
    activeWalletInfo.value = walletStore.getActiveWalletInfo()
    initialized.value = true 
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
        {{  Utils.maskAddress( walletStore.activeWalletFull ) }}  | ETH
    </button>
    <div class="modal"  
        data-bs-backdrop="static" 
        id="netAndAcctModal" 
        tabindex="-1"
    >
        <div class="modal-dialog dialog-sm show">
            <div class="modal-content rounded-lg mt-10">
                <div class="modal-body shadow">
                  
                    <div class="pt-3 pb-2">
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
                            <div class="active-wallet-addr p-2 mt-2 border rounded d-flex justify-content-center  align-items-center">
                                <div class="text-break">{{ walletStore.activeWalletFull }}</div>
                                <button class="btn btn-secondary p-2 rounded ms-2" >
                                    <Icon name='solar:copy-bold-duotone' :size="24" />
                                </button>
                            </div>
                        </div>
                        
                        <div class="mt-5">
                            <button data-bs-dismiss="modal" class="btn btn-primary full-width btn-lg rounded">
                                Close
                            </button>
                        </div>
                    </div>
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