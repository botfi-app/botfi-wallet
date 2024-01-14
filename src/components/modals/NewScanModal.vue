
<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';    
import { Modal as bsModal } from 'bootstrap'
import Http from '../../classes/Http';
import { useRouter } from "vue-router"

const isLoading = ref(false)
const initialErrMsg = ref("")
const id = ref("new-scan-modal")
const chainId = ref("")
const contract = ref("")
const supportedChains = ref({})

const emits = defineEmits(["submit"])

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try{

        isLoading.value = true 

        let dbData = (localStorage.getItem("scanner_chains") || "").trim()

        if(dbData != ""){
           try {
             let dataJson = JSON.parse(dbData)
             if(dataJson.length > 0) {
                supportedChains.value = dataJson
             }
           } catch(e){}
        }

        let resultStatus = await Http.getApi("/scanner/chains")

        if(resultStatus.isError()){
            initialErrMsg.value = resultStatus.getMessage()
            return false;
        }

        let resultData = (resultStatus.getData() || [])
        localStorage.setItem("scanner_chains", JSON.stringify(resultData))

        supportedChains.value = resultData
    } catch(e){

        Utils.logError("NewScanModal#initialize:", e)
        initialErrMsg.value = Utils.generalErrorMsg

    } finally {
        isLoading.value = false
    }
}

const onSubmit = async () => {

    if(!Utils.isAddress(contract.value)){
        return Utils.mAlert("A valid contract address is required")
    }

    let sc = supportedChains.value

    if(!(chainId.value in sc)){
        return Utils.mAlert("Select a valid network")
    }

    let chainName = sc[chainId.value].name

    emits("submit", chainId.value, chainName, contract.value)

    bsModal.getInstance('#'+id.value).hide()
}

</script>
<template>
    <Modal
        :id="id"
        title="New Scan"
        :has-header="true"
        :has-footer="false"
        size="modal-md"
    >
            <template #body>
                <loading-view :isLoading="isLoading">
                    <div class='m-2 my-3 px-3'>
                        <div class="form-floating mb-3">
                            <input v-model="contract"
                                type="text" 
                                class="form-control rounded" 
                                id="contract" 
                                placeholder="0x.."
                            />
                            <label for="contract">Contract Address</label>
                        </div>
                        <div class="form-floating">
                            <select v-model="chainId" 
                                class="form-select rounded" 
                                id="supported_chains"
                            >
                                <option value="">Select Network</option>
                                <template v-for="( item, idx ) in supportedChains">
                                    <option :value="item.absoluteChainId">
                                        {{ item.name.trim() }}
                                    </option>
                                </template>
                            </select>
                            <label for="supported_chains">
                                Network
                            </label>
                        </div>
                        <div class="mt-3">
                            <button @click.prevent="onSubmit"
                                class="btn btn-primary rounded w-full btn-lg"
                            >
                                Scan
                            </button>
                        </div>
                    </div>
                </loading-view>
            </template>
    </Modal>
</template>
<style lang="scss">
.form-select {
   
        text-transform: capitalize !important;
}
</style>