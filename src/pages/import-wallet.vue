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
const hasAgreedSeedPhraseTerms = ref(false)
const backUrl = ref("/set-pin?next=import-wallet")


onBeforeMount(async () => {
    
    if((await walletStore.hasDefaultWallet())) {
        isLoading.value = false
        return router.push("/login")
    }

    // lets check if we have password
    let password = await walletStore.getPassword()

    if(password == '' || password.length < 6){
        return router.push(backUrl.value)
    }

})


const onSave = async () => {

    try {


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
  >
    
    <div class="w-400">
        
      <NativeBackBtn :url="backUrl" />
      
      <div class="d-flex flex-column px-3 pb-5 align-items-center">

        <top-logo />
        
        <div class="text-md text-center my-2 muted hint">
          <div>Paste the 12 words seed phrase below</div> 
          <div class="my-1">
            <a href="#" class="btn btn-primary btn-sm rounded-pill">
              <div class="d-flex center-vh">
                <Icon name="material-symbols-light:content-paste" />
                <div>Paste Words</div>
              </div>
            </a>
          </div>
        </div>
      </div>
      
    </div>
  </main-layout>
</template>