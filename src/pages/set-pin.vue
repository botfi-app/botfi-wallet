<script setup>

import { onBeforeMount, ref, watch } from "vue"
import { useRouter, useRoute } from 'vue-router';
import { useWalletStore } from "../store/walletStore";
import Utils from "../classes/Utils";
import MainBtn from "../components/common/MainBtn.vue";

const router = useRouter()
const route  = useRoute()
const walletStore = useWalletStore()

const initialized = ref(false)
const pin1 = ref("")
const pin2 = ref("")
const hasAgreedNoPinReset    = ref(false)
const hasAgreedNoPinOnServer = ref(false)
const isLoading = ref(false)

onBeforeMount(() => {
    if(getNextPage() == ""){
       return router.push("/")
    }

    if(getNextPage() == "create-wallet" &&  walletStore.hasDefaultWallet()){
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

const isPinSequential = (value) => {
    
    var pinArr = value.toString().split('');

    for (let i = 0; i < pinArr.length - 1; i++) {
        if (parseInt(pinArr[i]) >= parseInt(pinArr[i + 1]))
        return false;
    }

    return true;
}

const onSave = async () => {
    
    try {

        let p1 = pin1.value.toString()

        if(p1.trim() == '' || p1.length < 4 || !/[0-9]+/.test(p1)){
            return Utils.errorAlert("A valid numeric value is required")
        }

        p1 = parseInt(p1)
        let p2 = parseInt(pin2.value)

    
        if(p1 != p2){
            return Utils.errorAlert("Pin codes do not match")
        }

        if(isPinSequential(p1)){
            return Utils.errorAlert("Weak pin code")
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
        <div class="d-flex flex-column w-400 pb-5 align-items-center">
            
            <top-logo />

            <div>
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

            <div class="form-check mx-5 my-4">
                <input 
                    v-model="hasAgreedNoPinOnServer"
                    class="form-check-input" 
                    type="checkbox" 
                    id="hasAgreedNoPinOnServer"
                />
                <label class="form-check-label hint" for="hasAgreedNoPinOnServer">
                    I understand that the password won't be sent to BotFi's server
                </label>
            </div>

            <div class="form-check mx-5 mb-4">
                <input 
                    v-model="hasAgreedNoPinReset"
                    class="form-check-input" 
                    type="checkbox" 
                    id="hasAgreedNoPinReset"
                />
                <label class="form-check-label hint" for="hasAgreedNoPinReset">
                    I understand that the password cannot be resetted when forgotten
                </label>
            </div>

            <div class="mt-4 w-full px-5">
                <MainBtn
                    text="Next"
                    :onClick="onSave"
                    :isLoading="isLoading"
                />
            </div>
        </div>
    </main-layout>
</template>
