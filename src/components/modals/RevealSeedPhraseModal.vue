<script setup>
import { onUpdated, ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue';
import PinCode from '../common/PinCode.vue';    
import { useWalletStore } from '../../store/walletStore';

const props = defineProps({
    data: { type: Object, required: true }
})

const emits = defineEmits(["success"])

const walletStore = useWalletStore()
const pin = ref("")
const seedPhrase  = ref("")

const revealSeedPhrase = async () => {

    let loader;

    try{

        let _p = pin.value.toString().trim()

        if(_p == ""){
            return Utils.mAlert("Pin code is required")
        }

        loader = Utils.loader("Decrypting seed phrase")

        loader.close()

        seedPhrase.value = walletStore.defaultWallet.phrase

    } catch(e){
        Utils.logError("RevealSeedPhraseModal#revealSeedPhrase", e)
        Utils.mAlert(Utils.generalErrorMsg)
        if(loader) loader.close()
    }
    
}

</script>
<template>
    <Modal
        id="reveal_seed_phrase_modal"
        title="Reveal Seed Phrase"
        :has-header="true"
        :has-footer="false"
        size="modal-md"
        @hide="()=> seedPhrase=''"
    >
            <template #body>
                <div class='px-3 py-2'>
                            
                    <div class="w-full d-flex flex-column align-items-center justify-content-center pb-3" 
                        v-if="seedPhrase==''"
                    >
                        <div class=" w-full px-2">
                            <PinCode 
                                label="Pin"
                                @change="(v) => pin = v"
                            />
                        </div>
                        <div class="mt-4 px-2 w-full ">
                            <button @click.prevent="revealSeedPhrase" 
                                    class="btn rounded-pill btn-primary w-full"
                            >
                                Reveal
                            </button>
                        </div>
                    </div>
                    <div class="w-full" v-else>
                        <div class="form-floating">
                            <textarea 
                                class="form-control rounded mt-1" 
                                placeholder=""
                                id="textarea_seed_phrase" 
                                style="min-height: 100px;"
                                :readonly="true"
                                v-model="seedPhrase" 
                            />
                            <label for="textarea_seed_phrase">Seed Phrase</label>
                        </div>
                        <div class="my-3">
                            <button 
                                @click.prevent="Utils.copyText({ text: seedPhrase, showToast: true })"
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