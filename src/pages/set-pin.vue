<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, watch } from "vue"
import { useRouter, useRoute } from 'vue-router';
import { useWalletStore } from "../store/walletStore";
import Utils from "../classes/Utils";
import NativeBackBtn from "../components/common/NativeBackBtn.vue";

const router = useRouter()
const route  = useRoute()
const walletStore = useWalletStore()

const initialized = ref(false)
const pin1 = ref("")
const pin2 = ref("")
const hasAgreedNoPinReset    = ref(false)
const hasAgreedNoPinOnServer = ref(false)
const isLoading = ref(false)

onBeforeMount( async () => {

    //console.log("getNextPage()===>", getNextPage())

    if(getNextPage() == ""){
       return router.push("/")
    }

    if(getNextPage() == "create-wallet" &&  (await walletStore.hasDefaultWallet())){
        return router.push("/login")
    }

    initialized.value = true
})

const getNextPage = () => {
    
    let nextPage = route.query.next || ""

    //console.log(" route.query",  route.query)
    
    if(!["create-wallet", "import-wallet", "settings"].includes(nextPage)){
        return ""
    }

    return nextPage;
}

const onSave = async () => {
    
    try {

        let p1 = pin1.value.toString()

        if(p1.trim() == '' || p1.length < 6 || !/[0-9]+/.test(p1)){
            return Utils.errorAlert("A valid numeric value is required")
        }
        
        if(p1.split('').every(char => char === p1[0])){
            return Utils.errorAlert("Weak pin code")
        }

        p1 = parseInt(p1)
        let p2 = parseInt(pin2.value)

    
        if(p1 != p2){
            return Utils.errorAlert("Pin codes do not match")
        }

        if(!(hasAgreedNoPinOnServer.value && hasAgreedNoPinReset.value)){
            return Utils.errorAlert("Accept our terms to proceed")
        }

        isLoading.value = true
    
        // lets save the password in walletStore 
        walletStore.setPassword(p1) 

        router.push(`/${getNextPage()}`)

    } catch(e){
        Utils.logError("set-pin.vue#onSave:", e)
        Utils.unknownErrorAlert()
    } finally {
        isLoading.value = false 
    }
 }
</script>
<template>
    <main-layout 
        :has-back-btn="true" 
        title="Set Pin"
        v-if="initialized"
    >
        <div class="p-3 space-between">
            <NativeBackBtn 
                url="/" 
                btn-class="btn btn-warning px-3" 
                text="Back"  
            />
            <button class="btn btn-outline rounded-circle">
                dfdß
            </button>
        </div>

        <div class="d-flex flex-column w-400 pb-5 align-items-center">

            <top-logo />
        
            <div class="px-4 w-full">
                <div class="mb-3">
                    <PinCode 
                        label="Set Pin"
                        @change="(v) => pin1 = v"
                    />
                </div>
                <div>
                    <PinCode 
                        label="Confirm Pin"
                        @change="(v) => pin2 = v"
                    />
                </div>
            </div>
            <div class="form-check mx-4 my-4">
                <input 
                    v-model="hasAgreedNoPinOnServer"
                    class="form-check-input" 
                    type="checkbox" 
                    id="hasAgreedNoPinOnServer"
                />
                <label class="form-check-label hint" for="hasAgreedNoPinOnServer">
                    I understand that the password won't be stored on BotFi's server
                </label>
            </div>

            <div class="form-check mx-4 mb-4">
                <input 
                    v-model="hasAgreedNoPinReset"
                    class="form-check-input" 
                    type="checkbox" 
                    id="hasAgreedNoPinReset"
                />
                <label class="form-check-label hint" for="hasAgreedNoPinReset">
                    I understand that the password cannot be reset if forgottens
                </label>
            </div>

            <div class="mt-4 w-full px-4">
                <button @click.prevent="onSave" class="btn rounded-pill btn-primary w-full">
                    Continue
                </button>
            </div>
        </div>
    </main-layout>
</template>

 