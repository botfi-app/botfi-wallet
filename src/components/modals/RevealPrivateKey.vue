<script setup>
import { onUpdated, ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';
import PinCode from '../common/PinCode.vue';    
import { Modal as bsModal } from 'bootstrap'
import { useWalletStore } from '../../store/walletStore';

const props = defineProps({
    id: String, 
    data: { type: Object, required: true }
})

const emits = defineEmits(["success"])

const walletStore = useWalletStore()
const pin = ref("")
const privateKey  = ref("")

const revealPk = async () => {

    let loader;

    try{

        let _p = pin.value.toString().trim()

        //console.log("_p===>", _p)

        if(_p == ""){
            return Utils.mAlert("Pin code is required")
        }

        let addr = props.data.address

        loader = Utils.loader("Decrypting Wallet")

        let resultStatus = await walletStore.decryptPrivateKey(addr, _p)

        loader.close()

        if(resultStatus.isError()){
            return Utils.mAlert(resultStatus.getMessage())
        }

        let walletInfo = resultStatus.getData() || {}

        //console.log("resultStatus===>", resultStatus)

        privateKey.value = walletInfo.decryptedPk || ""

    } catch(e){
        Utils.logError("RevealPrivateKey#revealPk", e)
        Utils.mAlert(Utils.generalErrorMsg)
        if(loader) loader.close()
    }
    
}

const doCopy = async () => {    
    if((await Utils.copyToClipboard(privateKey.value)) == 'copied'){
        Utils.toast("Private key copied")
    } else {
        Utils.toast("Failed to copy private key")
    }
}
</script>
<template>
    <Modal
        :id="id"
        title="Reveal Private Key"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
    >
            <template #body>
                <div class='px-3 py-2'>
                            
                    <div class="w-full d-flex flex-column align-items-center justify-content-center pb-3" 
                        v-if="privateKey==''"
                    >
                        <div>
                            <PinCode 
                                label="Pin"
                                @change="(v) => pin = v"
                            />
                        </div>
                        <div class="mt-4 px-2 w-full ">
                            <button @click.prevent="revealPk" 
                                    class="btn rounded-pill btn-primary w-full"
                            >
                                Reveal
                            </button>
                        </div>
                    </div>
                    <div class="w-full" v-else>
                        <div class="form-floating mb-3 rounded">
                            <input 
                                type="text" 
                                :value="props.data.address"
                                class="form-control rounded" 
                                id="w_address" 
                                :readonly="true"
                                :disabled="true"
                            />
                            <label for="w_address">
                                <span class="">Address</span> 
                                <span class="hint muted fs-12 font-monospace">
                                    ({{ props.data.name }})
                                </span>
                            </label>
                        </div>
                        <div class="form-floating">
                            <textarea 
                                class="form-control rounded" 
                                placeholder=""
                                id="textarea_reveal_pk" 
                                style="min-height: 80px"
                                :readonly="true"
                                v-model="privateKey" 
                            />
                            <label for="textarea_reveal_pk">Private Key</label>
                        </div>
                        <div class="my-3">
                            <button @click.prevent="doCopy"
                                class="btn btn-success w-full rounded fw-semibold"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </template>

        </Modal>
</template>