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

    let _p = pin.value.toString().trim()

    if(_p == ""){
        return Utils.mAlert("Pin code is required")
    }

    let addr = props.data.address

    let resultStatus = await walletStore.getPrivateKey(addr, _p)
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
                <div class='m-2 my-3 pb-3 center-vh'>
                            
                    <div v-if="privateKey==''">
                        <div>
                            <PinCode 
                                label="Pin"
                                @change="(v) => pin = v"
                            />
                        </div>
                        <div class="mt-4 w-full ">
                            <button @click.prevent="revealPk" 
                                    class="btn rounded-pill btn-primary w-full"
                            >
                                Reveal
                            </button>
                        </div>
                    </div>
                    <div v-else>
                
                        <div class="form-floating">
                            <textarea class="form-control" 
                                placeholder=""
                                id="textarea_reveal_pk" 
                                style="height: 100px"
                                :readonly="true" 
                            />
                            <label for="textarea_reveal_pk">Private Key</label>
                        </div>
                        <div class="my-3">
                            <button @click.prevent="copyPrivateKey"
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