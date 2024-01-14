<script setup>
import { ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';    
import { Modal as bsModal } from 'bootstrap'
import { useWalletStore } from '../../store/walletStore';

const props = defineProps({
    id: String
})

const emits = defineEmits(["success"])

const walletStore = useWalletStore()
const privateKey  = ref("")
const walletName  = ref("")

const importWallet = async () => {
    
    let loader; 

    try {

        let name = walletName.value.trim()

        if(name == ''){
            return Utils.mAlert("Wallet name is required")
        }

        let pk = privateKey.value.trim()

        if(pk == ''){
            return Utils.mAlert("Private key is required")
        }

        loader = Utils.loader("Importing Wallet")

        let resultStatus = await walletStore.importWalletFromPrivateKey(name, pk)

        loader.close()

        if(resultStatus.isError()){
            return Utils.mAlert(resultStatus.getMessage())
        }

        walletName.value = ''
        privateKey.value = ''

        let bsm = bsModal.getOrCreateInstance("#"+props.id)
        bsm.hide()

        emits("success")
        
    } catch(e){
        if(loader) loader.close()
        Utils.logError("ImportWalletByPk#importWallet:", e)
        Utils.mAlert(Utils.generalErrorMsg)
    }
}
</script>
<template>
    <Modal
        :id="id"
        title="Import Wallet"
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
                    <div class="form-floating">
                        <textarea 
                            class="form-control rounded" 
                            placeholder="Paste private key here"
                            id="txt_import_wallet" 
                            style="min-height: 100px"
                            v-model="privateKey" 
                        />
                        <label for="txt_import_wallet">Private Key</label>
                    </div>
                    <div class="my-3">
                        <button @click.prevent="importWallet"
                            class="btn btn-primary w-full rounded fw-semibold"
                        >
                            Import
                        </button>
                    </div>
                </div>
            </template>

        </Modal>
</template>