<script setup>
import { ref, onBeforeMount, inject, toValue } from "vue"
import { useWalletStore } from "../store/walletStore";
import { useRouter } from "vue-router";
import Wallet from "../classes/Wallet";
import LoadingView from "../layouts/LoadingView.vue";
import Utils from "../classes/Utils";

const botUtils = inject("botUtils")
const walletStore = useWalletStore()
const walletInfo = ref(null)
const seedPhraseArray = ref([])
const router = useRouter()
const isLoading                = ref(false)
const hasAgreedSeedPhraseTerms = ref(false)
const backUrl = ref("/set-pin?next=import-wallet")
const clipboard = ref()

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

    clipboard.value = botUtils.clipboard()

    console.log("clipboard===>", clipboard)

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

const pasteWords = async () => {

  let c = clipboard.value; 

  if(!c.isSupported()) return; 

  c.readText((text) => {
    console.log("text====>", text)
  })
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
            <a href="#" @click.prevent="pasteWords" 
              class="btn btn-primary btn-sm rounded-pill"
              v-if="clipboard && clipboard.isSupported()"
            >
              <div class="d-flex center-vh">
                <Icon name="material-symbols-light:content-paste" />
                <div>Paste Words</div>
              </div>
            </a>
          </div>
        </div>

        <div class="row px-3">
          <template v-for="(_,index) in (new Array(12))" :key="index">
            <div class="col-6 col-md-4 p-2">
              <div class="form-floating">
                <input type="text" 
                  class="form-control rounded" 
                  :id="`phrase-word-${index}`"
                  v-model="seedPhraseArray[index]"
                />
                <label :for="`phrase-word-${index}`">
                  Word #{{ index+1 }}
                </label>
              </div>
            </div>
          </template>
        </div>

      </div>
    </div>
  </main-layout>
</template>