<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

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

    ///console.log("clipboard===>", clipboard.value)

})


const onSave = async () => {

    try {


        if(!hasAgreedSeedPhraseTerms.value){
            Utils.mAlert("Accept our terms to continue")
            return false
        }

        let seedPhraseArr = seedPhraseArray.value 

       // console.log("seedPhraseArr.length ===>", seedPhraseArr.length )

        if(seedPhraseArr.length != 12){
          return Utils.mAlert("Provide all the words below")
        }

        for(let index in seedPhraseArr){
          let wordNo = parseInt(index) + 1
          let word = (seedPhraseArr[index] || "").trim()
          if(word == ""){
            return Utils.mAlert(`Word #${wordNo} cannot be empty`)
          }
        }

        let loader = Utils.loader("Saving on device")

        let walletInfoStatus = await Wallet.createWalletFromSeedPhrase(seedPhraseArr.join(" "))

        if(walletInfoStatus.isError()){
          return Utils.mAlert(walletInfoStatus.getMessage())
        }

        let walletInfo = walletInfoStatus.getData()

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

  c.readText((textData) => {

    textData = textData.trim()

    if(textData == '') return true;

    let dataArr = textData
                    .replace(/^\s+|\s+$/g,'')
                    .split(/\s+/);

    if(dataArr.length != 12) return true;

    seedPhraseArray.value = dataArr

  })

}

const onFirstInputPaste = (e, index) => {

  let pastedData = e.clipboardData.getData('text')

  if(pastedData == '') return true;

  let pastedDataArr = pastedData
                        .replace(/^\s+|\s+$/g,'')
                        .split(/\s+/);

  if(pastedDataArr.length != 12) return true;

  seedPhraseArray.value = pastedDataArr

  e.preventDefault()

}
</script>

<template>
  <main-layout
      title="Create Wallet"
      :show-nav="false"
      :backUrl="backUrl"
  >
    
    <div class="w-400">
      
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
                  v-model="seedPhraseArray[parseInt(index)]"
                  :data-index="index"
                  @paste="e => onFirstInputPaste(e,index)"
                />
                <label :for="`phrase-word-${index}`">
                  Word #{{ index+1 }}
                </label>
              </div>
            </div>
          </template>
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
        <div class=" w-full">
          <button @click.prevent="onSave" 
            class="btn btn-success w-full rounded-pill"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  </main-layout>
</template>