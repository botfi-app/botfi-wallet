<script setup>
import { ref, onBeforeMount, onMounted } from "vue"
import { useKeyStore } from "../store/keystore";
import { useRouter } from "vue-router";
import Wallet from "../classes/Wallet";
import LoadingView from "../layouts/LoadingView.vue";

const keystore = useKeyStore()
const mnemonic = ref(null)
const seedPhraseArray = ref([])
const router = useRouter()
const isLoading = ref(false)
const seedPhraseCopied = ref(false)
const isPhraseHidden = ref(true)

const initialize = async () => {

   let walletStatus = await Wallet.generateMnemonic()

   if(walletStatus.isError()){
     error.value = walletStatus.getMessage()
     return false;
   }

   mnemonic.value = walletStatus.getData()
   seedPhraseArray.value = mnemonic.value.mnemonic.phrase.split(" ");

  // console.log("seedPhraseArray.value==>", seedPhraseArray.value)
}

onBeforeMount(() => {
    
    if(keystore.hasMnemonic()){
        isLoading.value = false
        return router.push("/")
    }

    // lets check if we have password
    let password = keystore.password.trim()

    if(password == ''){
        return router.push("/set-password?next=create-wallet")
    }
})

onMounted(() => {
    initialize()
})

const saveWalletInfo = async () => {

}
</script>

<template>
    <main-layout
        title="Create Wallet"
        :show-nav="false"
    >
        <k-navbar 
            title="Password" 
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
                <div class="py-5 grid grid-rows-3 grid-cols-4">
                    <template v-for="(word,index) in seedPhraseArray">
                        <k-button tonal class="bg-cyan-20 p-5" :disabled="true">  
                            {{  }}
                        </k-button>
                    </template>
                </div>
            </Loading-view>
        </k-block>
    </main-layout>
</template>