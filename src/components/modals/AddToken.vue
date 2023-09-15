<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

 
import { ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';    
import { Modal as bsModal } from 'bootstrap'
import { useTokens } from '../../composables/useTokens';

const props = defineProps({
    id:     String
})

const emits = defineEmits(["success"])

const tokens = useTokens()
const contractAddr = ref("")

const importCustomToken = async () => {
    
    let loader; 

    try {

        let contract = contractAddr.value.trim()

        if(!Utils.isAddress(contract)){
            return Utils.mAlert("a valid ERC-20 contract address required")
        }

        loader = Utils.loader("Fetching token's metadata")

        let resultStatus = await tokens.getERC20TokenInfo(contract)

        console.log("resultStatus===>", resultStatus)

        if(resultStatus.isError()){
            loader.close()
            return Utils.mAlert(resultStatus.getMessage())
        }

        contractAddr.value = ''

        let bsm = bsModal.getOrCreateInstance("#"+props.id)
        bsm.hide()

        emits("success")
        
    } catch(e){
        if(loader) loader.close()
        Utils.logError("addToken#importCustom:", e)
        Utils.mAlert(Utils.generalErrorMsg)
    }
}
</script>
<template>
    <Modal
        :id="id"
        title="Add Custom Token"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
        >
            <template #body>
                <div class='m-2 my-3'>
                    <div class="form-floating mb-3 rounded">
                        <input type="text" 
                            v-model="contractAddr"
                            class="form-control rounded" 
                            id="contract_addr" 
                            placeholder="eg. 0x.."
                            :autocapitalize="false"
                            :autocomplete="false"
                            :autocorrect="false"
                        />
                        <label for="contract_addr">Contract Address</label>
                    </div>
                    <div class="my-3">
                        <button @click.prevent="importCustomToken"
                            class="btn btn-primary w-full rounded fw-semibold"
                        >
                            Import Token
                        </button>
                    </div>
                </div>
            </template>

        </Modal>
</template>