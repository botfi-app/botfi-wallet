<script setup>
import { ref, onBeforeMount, inject, toValue } from "vue"
import { useWalletStore } from "../store/walletStore";
import { useRouter } from "vue-router";
import Wallet from "../classes/Wallet";
import LoadingView from "../layouts/LoadingView.vue";
import clipboard from "clipboard"
import Utils from "../classes/Utils";

const botUtils = inject("botUtils")
const walletStore = useWalletStore()
const walletInfo = ref(null)
const seedPhraseArray = ref([])
const initialized = ref(false)
const router = useRouter()
const isLoading                = ref(false)
const hasCopiedSeedPhrase      = ref(false)
const copyBtnClicked           = ref(false) 
const hasAgreedSeedPhraseTerms = ref(false)
const isPhraseHidden           = ref(true)

const initialize = async () => {

   isLoading.value = true 

   let walletStatus = await Wallet.createWallet(toValue(walletStore.password))

   if(walletStatus.isError()){
     error.value = walletStatus.getMessage()
     return false;
   }

   walletInfo.value = walletStatus.getData()
   seedPhraseArray.value = walletInfo.value.mnemonic.phrase.split(" ");

  isLoading.value = false 
  initialized.value = true

}

onBeforeMount(async () => {
    
    if((await walletStore.hasDefaultWallet())) {
        isLoading.value = false
        return router.push("/login")
    }

    // lets check if we have password
    let password = await walletStore.getPassword()

    if(password == ''){
        return router.push("/set-pin?next=create-wallet")
    }

    initialize()

    let cb = new clipboard("#copy-btn")

    cb.on('success', (e) => {
        Utils.toast("Copied to clipboard")
        copyBtnClicked.value = true
    });

})


const onSave = async () => {

    try {

        if(!copyBtnClicked.value){
            Utils.mAlert("Copy the seed phrase by clicking the copy button")
            return false
        }

        if(!hasCopiedSeedPhrase.value){
            Utils.mAlert("Kindly accept that you copied the seed phrase")
            return false
        }

        if(!hasAgreedSeedPhraseTerms.value){
            Utils.mAlert("Accept our terms to continue")
            return false
        }

        let loader = Utils.loader("Saving on device")

        let saveStatus =   await Utils.runBlocking(
                                () => walletStore.saveDefaultWallet(toValue(walletInfo))
                            )

        loader.close()

        if(saveStatus.isError()){
             Utils.mAlert(saveStatus.getMessage())
            return false
        }

        router.push("/wallet")

    } catch(e){
        Utils.logError("create-wallet.vue#onSave:", e)
        Utils.unknownErrorAlert()
    } finally {
        isLoading.value = false 
    }

}
</script>

<template>
    <main-layout
        title="Create Wallet"
        :show-nav="false"
        v-if="initialized"
    >
     
        <div class="w-400">
            
            <NativeBackBtn  />

            <loading-view :isLoading="isLoading">

                <div class="d-flex flex-column px-3 pb-5 align-items-center">
                    
                    <top-logo />
                    
                    <div class="text-md text-center my-2 muted hint">
                        This seed phrase is the key to your wallet, save it securely 
                        for future recovery of your wallet & funds
                    </div>
                    <div class="py-2 row">
                        <template v-for="(word,index) in seedPhraseArray" :key="index">
                            <div class="col-6 col-md-4 p-1 px-2">
                                <div
                                    click.prevent 
                                    class="phrase-word bg-darken3-alpha px-4 py-3 w-full rounded text-dark" 
                                    :disabled="true"
                                >  
                                    {{ isPhraseHidden ? "***" : word }}
                                </div>
                            </div>
                        </template>
                    </div>

                    <div class="mt-4 h-divider" />

                    <div class="mt-4 mb-4">
                        <div class="form-check">
                            <input 
                                v-model="hasCopiedSeedPhrase"
                                class="form-check-input" 
                                type="checkbox" 
                                id="hasCopiedSeedPhrase"
                            />
                            <label class="form-check-label hint" for="hasCopiedSeedPhrase">
                                I have copied the seed phrase & saved it securely
                            </label>
                        </div>
                        <div class="form-check my-4">
                            <input 
                                v-model="hasAgreedSeedPhraseTerms"
                                class="form-check-input" 
                                type="checkbox" 
                                id="hasAgreedSeedPhraseTerms"
                            />
                            <label class="form-check-label hint" for="hasAgreedSeedPhraseTerms">
                                I understand that the seed phrase won't be saved on BotFi's servers
                            </label>
                        </div>
                    </div>
                    <div class="d-flex flex-row pb-4 w-full">
                        <button
                            class="btn btn-secondary rounded-pill mx-1 w-full" 
                            @click="isPhraseHidden=!isPhraseHidden"
                        >
                            {{ isPhraseHidden ? "Reveal" : "Hide" }}
                        </button>
                        <button 
                            class="btn btn-info rounded-pill mx-1 w-full"
                            id="copy-btn"
                            :data-clipboard-text="seedPhraseArray.join(' ')"
                        >
                            Copy
                        </button>
                    </div>

                    <div class=" w-full">
                        <button @click.prevent="onSave" class="btn rounded-pill btn-primary w-full">
                            Continue
                        </button>
                    </div>
                </div>
            </loading-view>
        </div>
    </main-layout>
</template>
