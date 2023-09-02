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
import { useNetworks } from '../../composables/useNetworks';

const initialized   = ref(false)
const net           = useNetworks()
const {  allNetworks } = net;
const route         = useRoute()
const pageTitle     = ref("")
const subTitle      = ref("")

const formData      = ref({
    name: "",
    nativeCurrency: { symbol: ""},
    chainId:   null,
    rpc:      [''],
    explorers: ['']
})
const saveType      = ref("")
const netChainId    = ref(null)
const pageError     = ref("")
const isEdit        = ref(false)
const setAsDefault  = ref(false)

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try{
        pageError.value = ""
        saveType.value = route.params.save_type

        await net.getUserNetworks()    

        let allNets = allNetworks.value

        pageTitle.value = "Add Network"

        if(saveType.value == 'edit') {
            
            let chainId = route.query.chainId || ""

            if(!/[0-9]+/.test(chainId) || !(chainId in allNets)){
                pageError.value = `A valid chain id is required`
                return false;
            }

            isEdit.value = true

            chainId = parseInt(chainId)

            formData.value = allNets[chainId]

            pageTitle.value = "Edit Network"
            subTitle.value = formData.value.name

            netChainId.value = chainId

        }


    } catch(e){
        Utils.logError(e)
        pageError.value = Utils.generalErrorMsg
    } finally {
        initialized.value = true
    }
}

const onSave = async () => {

    let loader;

    try {

        let fd = formData.value

        let rpc = (fd.rpc[0] || "").trim()
        let currencySymbol = (fd.nativeCurrency.symbol || "").trim();

        if(fd.name.trim() == ''){
            return Utils.mAlert("A valid name is required")
        }

        if(rpc == '' || !Utils.isValidUrl(rpc)){
            return Utils.mAlert("A valid rpc url is required")
        }

        if(!fd.chainId || parseInt(fd.chainId) <= 0){
            return Utils.mAlert("Chain ID requires a valid numeric value")
        }

        let chainId = parseInt(fd.chainId)

        if(currencySymbol == ""){
            return Utils.mAlert("Currency Symbol requires a valid value")
        }

        // explorer
        let explorer = (fd.explorers[0] || "").trim()

        if(explorer != ""){
            if(!Utils.isValidUrl(explorer)){
                return Utils.mAlert("A valid explorer url is required")
            }
        }

        //lets get the chain info 
        loader = Utils.loader("Saving Network")

        let netInfoStatus = await net.fetchNetworkInfo(rpc)

        if(netInfoStatus.isError()){
            return Utils.mAlert(netInfoStatus.getMessage())
        }

        let netInfo = netInfoStatus.getData()

        if(netInfo.chainId != chainId){
            return Utils.mAlert(`The RPC node returned a different chain id: ${netInfo.chainId}`)
        }

        formData.value.chainId = chainId

        let saveStatus = await net.saveNetwork(formData.value, setAsDefault.value)
        
        if(saveStatus.isError()){
            return Utils.mAlert(saveStatus.getMessage())
        }

        Utils.toast("Network Saved")
    } catch(e){
        Utils.logError(e)
        Utils.errorAlert(Utils.generalErrorMsg)
    } finally {
        if(loader) loader.close()
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
            <div class="fixed-topnav">
                <div class="d-flex body-bg justify-content-between flex-nowrap p-3 align-items-center">
                    <div>
                        <div class="fw-semibold fs-6 pe-2">
                            {{ pageTitle }}
                        </div>
                        <div class="mt-1 fw-semibold fs-12 text-truncate" v-if="subTitle != ''">
                            {{ subTitle }}
                        </div>
                    </div>
                   
                    <div class="ps-2">
                        <button class="btn btn-primary rounded-pill px-3" @click.prevent="onSave">
                            Save
                        </button>
                    </div>
                </div>
            </div>
            <div class="form-group px-3 pb-2">

                <div class="form-floating mb-3">
                    <input 
                        v-model="formData.name"
                        type="text" 
                        class="form-control rounded" 
                        :autocapitalize="false"
                        :autocomplete="false"
                        :autocorrect="false"
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
                        :autocapitalize="false"
                        :autocomplete="false"
                        :autocorrect="false"
                        id="rpc" 
                        placeholder="Network RPC URL"
                    />
                    <label for="rpc">RPC URL</label>
                </div>

                <div class="form-floating mb-3">
                    <input 
                        v-model.number="formData.chainId"
                        type="number" 
                        inputmode="numeric" 
                        :autocapitalize="false"
                        :autocomplete="false"
                        :autocorrect="false"
                        pattern="[0-9]*"
                        @keypress="Utils.onlyNumber($event)"
                        class="form-control rounded" 
                        id="chain_id" 
                        placeholder="eg. 1 for Ethereum"
                        :disabled="isEdit && netChainId==1"
                        :readonly="isEdit && netChainId==1"
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
                        v-model="formData.explorers[0]"
                        type="text" 
                        class="form-control rounded" 
                        id="explorer" 
                        placeholder="eg. etherscan.io"
                        :autocapitalize="false"
                    />
                    <label for="explorer">Block Explorer URL</label>
                </div>
                <div class="form-check">
                    <input 
                        v-model="setAsDefault" 
                        class="form-check-input" 
                        type="checkbox" 
                        value="" 
                        id="set-default"
                    >
                    <label class="form-check-label" for="set-default">
                        Set as Default
                    </label>
                </div>
            </div>
        </div>
    </WalletLayout>
</template>