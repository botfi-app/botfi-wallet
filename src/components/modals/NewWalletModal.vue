<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

 
import { ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';    
import { Modal as bsModal } from 'bootstrap'
import { useWalletStore } from '../../store/walletStore';

const props = defineProps({
    id: String, 
    title: String
})

const emits = defineEmits(["success"])

const walletStore = useWalletStore()
const walletName = ref("")

const createWallet = async () => {
    
    let loader; 

    try {

        let name = walletName.value.trim()

        if(name == ''){
            return Utils.mAlert("Wallet name required")
        }

        loader = Utils.loader("Generating Wallet")

        let resultStatus = await walletStore.deriveChildWallet(name)

        loader.close()

        if(resultStatus.isError()){
            return Utils.mAlert(resultStatus.getMessage())
        }

        walletName.value = ''

        let bsm = bsModal.getOrCreateInstance("#"+props.id)
        bsm.hide()

        emits("success")
        
    } catch(e){
        if(loader) loader.close()
        Utils.logError("NewWalletModal#createWallet:", e)
        Utils.mAlert(Utils.generalErrorMsg)
    }
}
</script>
<template>
    <Modal
        :id="id"
        :title="props.title"
        :has-header="true"
        :has-footer="false"
        size="modal-md"
    >
        <template #body>
            <div class='m-2 my-3'>
                <div class="form-floating mb-3 rounded">
                    <input type="text" 
                        v-model="walletName"
                        class="form-control rounded" 
                        id="wallet_name" 
                        placeholder="eg. Alice Wallet"
                        :autocapitalize="false"
                        :autocomplete="false"
                        :autocorrect="false"
                    />
                    <label for="wallet_name">Wallet Name</label>
                </div>
                <div class="my-3">
                    <button @click.prevent="createWallet"
                        class="btn btn-primary w-full rounded fw-semibold"
                    >
                        Create
                    </button>
                </div>
            </div>
        </template>

    </Modal>
</template>