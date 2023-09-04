<script setup>
import { onUpdated, ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';    
import { Modal as bsModal } from 'bootstrap'
import { useWalletStore } from '../../store/walletStore';

const props = defineProps({
    id: String, 
    data: { type: Object, required: true }
})

const emits = defineEmits(["success"])

const walletStore = useWalletStore()
const walletName = ref(props.data.name || "")


const doEditName = async () => {
    
    let loader; 

    try {

        let name = walletName.value.trim()

        if(name == ''){
            return Utils.mAlert("Wallet name required")
        }

        loader = Utils.loader("Generating Wallet")

        let addr = props.data.address;

        let resultStatus = await walletStore.updateWalletName(addr, name)

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
        Utils.logError("WalletNameEditor#doEditName:", e)
        Utils.mAlert(Utils.generalErrorMsg)
    }
}
</script>
<template>
    <Modal
        :id="id"
        title="Edit Name"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
        >
            <template #body>
                <div class='m-2 my-3'>
                    <div class="form-floating mb-3 rounded">
                        <input type="text" 
                           :value="props.data.address"
                            class="form-control rounded" 
                            id="w_address" 
                            :readonly="true"
                            :disabled="true"
                        />
                        <label for="w_address">
                            <span class="pe-2">Address</span> 
                            <span class="hint muted fs-12 font-monospace">
                                ({{ props.data.name }})
                            </span>
                        </label>
                    </div>
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
                        <label for="wallet_name">New Name</label>
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