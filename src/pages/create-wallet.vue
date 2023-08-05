<script setup>
import { ref, onBeforeMount, onMounted } from "vue"
import { useKeyStore } from "../store/keystore";
import { useRouter } from "vue-router";
import Wallet from "../classes/Wallet";
import LoadingView from "../layouts/LoadingView.vue";
import { useToast } from "../composables/useToast";
import clipboard from "clipboard"
import { useAlertDialog } from "../composables/useAlertDialog"

const alertDialog = useAlertDialog()
const toast = useToast()
const keystore = useKeyStore()
const mnemonic = ref(null)
const seedPhraseArray = ref([])
const router = useRouter()
const isLoading                = ref(false)
const hasCopiedSeedPhrase      = ref(false)
const hasAgreedSeedPhraseTerms = ref(false)
const isPhraseHidden           = ref(true)

const initialize = async () => {

   isLoading.value = true 

   let walletStatus = await Wallet.createWallet(keystore.password)

   if(walletStatus.isError()){
     error.value = walletStatus.getMessage()
     return false;
   }

   mnemonic.value = walletStatus.getData()
   seedPhraseArray.value = mnemonic.value.mnemonic.phrase.split(" ");

  isLoading.value = false 

}

onBeforeMount(() => {
    
    if(keystore.hasDefaultWallet()){
        isLoading.value = false
        return router.push("/")
    }

    // lets check if we have password
    let password = keystore.password.trim()

    if(password == ''){
        return router.push("/set-password?next=create-wallet")
    }

    initialize()

    let cb = new clipboard("#copy-btn")

    cb.on('success', (e) => {
        toast.open("Copied to clipboard")
    });


})


const saveWalletInfo = async () => {

    if(!hasCopiedSeedPhrase.value){
        return alertDialog.open("Kindly accept that you copied the seed phrase")
    }

    if(!hasAgreedSeedPhraseTerms.value){
        return alertDialog.open("Accept our terms to continue")
    }

    //keystore.saveMnemonic(mnemonic.value)
}
</script>

<template>
    <main-layout
        title="Create Wallet"
        :show-nav="false"
    >
        <k-navbar 
            title="Create Wallet" 
            centerTitle
        >
            <template #left>
                <k-navbar-back-link text="Back" @click="router.go(-1)" />
            </template>
            <template #right>
                <k-button 
                    rounded 
                    large 
                    class="k-color-primary btn mr-2 px-6"
                    @click.prevent="saveWalletInfo"
                >
                   Next
                </k-button>
            </template>
        </k-navbar>
        <k-block strong inset>
            <Loading-view :isLoading="isLoading">
                <div class="text-md text-center my-2">
                    This seed phrase is the key to your wallet, save it securely 
                    for future recovery of your wallet & funds
                </div>
                <div class="py-2 grid grid-rows-6 md:grid-rows-4 grid-cols-2 md:grid-cols-3">
                    <template v-for="(word,index) in seedPhraseArray" :key="index">
                        <div class="p-1">
                            <k-button tonal large class="k-color-primary text-white-alpha-80" :disabled="true">  
                                {{ isPhraseHidden ? "***" : word }}
                            </k-button>
                        </div>
                    </template>
                </div>
                <div class="relative hairline-b mt-4"></div>
                <div class="mt-5 mb-4">
                    <k-list>
                        <k-list-item label title="I have copied the seed phrase & saved it securely">
                            <template #media>
                                <k-checkbox
                                    component="div"
                                    name="demo-checkbox"
                                    :checked="hasCopiedSeedPhrase"
                                    @change="hasCopiedSeedPhrase = !hasCopiedSeedPhrase"
                                />
                            </template>
                        </k-list-item>
                        <k-list-item label title="I understand that the seed phrase won't be saved on BotFi's servers">
                            <template #media>
                                <k-checkbox
                                    component="div"
                                    name="demo-checkbox"
                                    :checked="hasAgreedSeedPhraseTerms"
                                    @change="hasAgreedSeedPhraseTerms = !hasAgreedSeedPhraseTerms"
                                />
                            </template>
                        </k-list-item>
                    </k-list>
                </div>
                <div class="flex flex-row pb-4">
                    <k-button 
                        rounded 
                        large 
                        raised 
                        class="k-color-secondary mx-1" 
                        @click="isPhraseHidden=!isPhraseHidden"
                    >
                        {{ isPhraseHidden ? "Reveal" : "Hide" }}
                    </k-button>
                    <k-button 
                        ripple 
                        rounded 
                        large 
                        raised 
                        class=" mx-1"
                        id="copy-btn"
                        :data-clipboard-text="seedPhraseArray.join(' ')"
                    >
                        Copy
                    </k-button>
                </div>
            </Loading-view>
        </k-block>
    </main-layout>
</template>