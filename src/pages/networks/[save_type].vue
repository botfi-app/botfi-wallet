<route>
    { path: "/networks/:save_type(add|edit)" }
</route>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import WalletLayout from '../../layouts/WalletLayout.vue';
import NativeBackBtn from '../../components/common/NativeBackBtn.vue';
import { useRoute } from 'vue-router';

const initialized   = ref(false)
const activeNetInfo = ref({})
const allNetworks   = ref({})
const walletStore   = useWalletStore()
const route         = useRoute()
const isLoading     = ref(false)
const pageTitle     = ref("")
const formData      = ref({
    chainName: "",
    nativeCurrency: { symbol: ""},
    rpc:      [],
    explorer: []
})
const saveType      = ref("")
const networkId     = ref(null)
const pageError     = ref("")
const isEdit        = ref(false)
const formError     = ref("")

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try{
        pageError.value = ""
        saveType.value = route.params.save_type

        let userNetworks = await walletStore.getUserNetworks()    
        activeNetInfo.value = userNetworks.networks[userNetworks.default]
        allNetworks.value = userNetworks.networks

        pageTitle.value = "Add Network"

        if(saveType.value == 'edit') {
            
            let netId = route.query.chainId || ""

            if(netId == "" || !(netId in allNetworks.value)){
                pageError.value = `A valid network id is required`
                return false;
            }

            isEdit.value = true

            formData.value = allNetworks[netId]

            pageTitle.value = `Edit Network: ${formData.value.name}`
        }


    } catch(e){
        Utils.logError(e)
        pageError.value = Utils.generalErrorMsg
    } finally {
        initialized.value = true
    }
}

const onSave = async () => {
    try {


    } catch(e){
        Utils.logError(e)
        Utils.errorAlert(Utils.generalErrorMsg)
    }
}
</script>
<template>
     <WalletLayout
        title="Networks"
        :show-nav="false"
        v-if="initialized"
        :page-error="pageError"
    >   

        <NativeBackBtn />

        <div class="w-400">
            <div class="d-flex justify-content-between flex-nowrap m-3 mb-4 align-items-center">
                <div class="fw-semibold fs-6 pe-2 text-truncate">{{pageTitle}}</div>
                <div class="ps-2">
                    <button class="btn btn-primary rounded-pill px-3" @click.prevent="onSave">
                        Save
                    </button>
                </div>
            </div>
            <div class="form-group px-3">

                <div class="form-floating mb-3">
                    <input 
                        v-model="formData.name"
                        type="text" 
                        class="form-control rounded" 
                        id="chain_name" 
                        placeholder="eg. Ethereum Mainnet"
                    />
                    <label for="chain_name">Network Name</label>
                </div>

                <div class="form-floating mb-3">
                    <input 
                        v-model="formData.rpc[0]"
                        type="text" 
                        class="form-control rounded" 
                        id="rpc" 
                        placeholder="Network RPC URL"
                    />
                    <label for="rpc">RPC URL</label>
                </div>

                <div class="form-floating mb-3">
                    <input 
                        v-model="formData.chainId"
                        type="number" 
                        class="form-control rounded" 
                        id="chain_id" 
                        placeholder="eg. 1 for Ethereum"
                        :disabled="isEdit"
                        :readonly="isEdit"
                    />
                    <label for="chain_id">Chain ID</label>
                </div>
                <div class="form-floating mb-3">
                    <input 
                        v-model="formData.nativeCurrency.symbol"
                        type="text" 
                        class="form-control rounded" 
                        id="currency_symbol" 
                        placeholder="eg. ETH"
                    />
                    <label for="currency_symbol">Currency Symbol</label>
                </div>
                <div class="form-floating mb-3">
                    <input 
                        v-model="formData.explorer[1]"
                        type="text" 
                        class="form-control rounded" 
                        id="explorer" 
                        placeholder="eg. etherscan.io"
                    />
                    <label for="explorer">Block Explorer URL</label>
                </div>
            </div>
        </div>
    </WalletLayout>
</template>