<script setup>
import { ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';    
import { Modal as bsModal } from 'bootstrap'
import { useWalletStore } from '../../store/walletStore';

const props = defineProps({
    id: String, 
    data: { type: Object, required: true }
})

const emits = defineEmits(["success"])

const modalTitle = ref("")
const itemAddr = ref("")
const walletStore = useWalletStore()
const walletName = ref("")

onUpdated(() => {
    if(props.data.address != itemAddr.value){
        
        itemAddr.value = props.data.address
        
        modalTitle.value = `<div class='px-2' style='line-height:15px;'>
                                <span class='fs-12 text-break'>${props.data.address}</span>
                                <span class='ms-1 fs-12 hint'>${props.data.name}</span>
                            </div>` 

        walletName.value = props.data.name;
    }
})

const doEditName = async () => {
    
    let loader; 

    try {

        let name = walletName.value.trim()

        if(name == ''){
            return Utils.mAlert("Wallet name required")
        }

        loader = Utils.loader("Generating Wallet")

        let resultStatus = await walletStore.updateWalletName(name)

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
        :title="modalTitle"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
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
                        <button @click.prevent="doEditName"
                            class="btn btn-primary w-full rounded fw-semibold"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </template>

        </Modal>
</template>