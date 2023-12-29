
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

const isLoading = ref(false)
const initialErrMsg = ref("")
const id = ref("new-scan-modal")
const chainId = ref("")
const contract = ref("")
const supportedChains = ref([])

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try{

        isLoading.value = true 

        let resultStatus = await Http.getApi("/scanner/chains")

        if(resultStatus.isError()){
            initialErrMsg.value = resultStatus.getMessage()
            return false;
        }

        supportedChains.value = (resultStatus.getData() || [])

    } catch(e){

        Utils.logError("NewScanModal#initialize:", e)
        initialErrMsg.value = Utils.generalErrorMsg

    } finally {
        isLoading.value = false
    }
}
</script>
<template>
    <Modal
        :id="id"
        title="New Scan"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
    >
            <template #body>
                <loading-view :isLoading="isLoading">
                    <div class='m-2 my-3'>
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
                                <template v-for="( name, id ) in supportedChains">
                                    <option :value="id">
                                        {{ name }}
                                    </option>
                                </template>
                            </select>
                            <label for="supported_chains">
                                Network
                            </label>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-primary rounded w-full btn-lg">
                                Scan
                            </button>
                        </div>
                    </div>
                </loading-view>
            </template>
    </Modal>
</template>