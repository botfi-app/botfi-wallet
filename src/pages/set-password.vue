<script setup>

import { inject, onBeforeMount, onMounted, ref, watch } from "vue"
import { useRouter, useRoute } from 'vue-router';
import { useWalletStore } from "../store/walletStore";
import { isStrongPassword } from "validator"

const router = useRouter()
const route  = useRoute()
const walletStore = useWalletStore()
const alertDialog = inject("alertDialog")

const initialized = ref(false)
const hasValidPassword = ref(false)
const password = ref("")
const password2 = ref("")
const passwordError = ref("")
const password2Error = ref("")
const hasAgreedNoPassReset  = ref(false)
const hasAgreedToNoPassOnServer = ref(false)


watch(password, () => {
    
    passwordError.value  = ""
    let p = password.value.trim()
    
    if(p.length > 0){
        
        if(!isStrongPassword(p, {minLength: 6 })){
            return passwordError.value = "Password not strong"
        }

        if(password2.value != ''){
            password2Error.value = ''
            if(password2.value != password.value){
                password2Error.value = "Passwords do not match"
            }
        }
    }
})

watch(password2, () => {
    password2Error.value = ""
    if(password2.value != password.value){
        password2Error.value = "Passwords do not match"
    }
})

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

const onPasswordSave = async () => {
    
   // console.log("passwordError.value===>", passwordError.value)

    if(password.value.trim() == ''){
        alertDialog.open("Error", "Password is required")
        return false;
    }

    if(!(passwordError.value == '' && password2Error.value == '')){
        return false;
    }

    if(!(hasAgreedNoPassReset.value && hasAgreedToNoPassOnServer.value)){
        alertDialog.open("Error", "Accept our terms to proceed")
        return false;
    }

    // lets save the password in walletStore 
    walletStore.setPassword(password.value) 

    router.push(`/${getNextPage()}`)
}
</script>
<template>
   <main-layout
        title="Password"
        :show-nav="false"
        v-if="initialized"
    >
        <k-navbar 
            title="Password" 
            centerTitle
        >
            <template #left>
                <k-navbar-back-link 
                    text="Back"
                    @click="router.push(getNextPage() == 'settings' ? '/settings' : '/')" 
                />
            </template>
            <template #right>
                <k-button 
                    rounded 
                    large 
                    class="k-color-primary btn mr-2 px-6"
                    @click.prevent="onPasswordSave"
                >
                    {{  getNextPage() == 'settings' ? 'Save' : 'Next' }}
                </k-button>
            </template>
        </k-navbar>
        <k-block strong inset>
            <k-list v-if="!hasValidPassword" class="p-0">
             
                <div class="my-2 mt-8 text-md px-2 text-center">
                    A password is required to encrypt the seed phrase for storage on your device
                </div>
                <k-list-input
                    label="Set Password"
                    floating-label
                    type="password"
                    placeholder="Type password"
                    :error="passwordError"
                    @input="e=> password = e.target.value"
                />
                <k-list-input
                    label="Confirm Password"
                    floating-label
                    type="password"
                    placeholder="Type password again"
                    :error="password2Error"
                    @input="e=> password2 = e.target.value"
                />

            </k-list>
            
            <div class="my-2">
                <valid-password-hints :password="password" />
            </div>
           
            <k-list>
                <k-list-item label title="I understand that the password cannot be resetted when forgotten">
                    <template #media>
                    <k-checkbox
                        component="div"
                        name="demo-checkbox"
                        :checked="hasAgreedNoPassReset"
                        @change="hasAgreedNoPassReset = !hasAgreedNoPassReset"
                    />
                    </template>
                </k-list-item>
                <k-list-item label title="I understand that the password won't be sent to BotFi's servers">
                    <template #media>
                    <k-checkbox
                        component="div"
                        name="demo-checkbox"
                        :checked="hasAgreedToNoPassOnServer"
                        @change="hasAgreedToNoPassOnServer = !hasAgreedToNoPassOnServer"
                    />
                    </template>
                </k-list-item>
            </k-list>

        </k-block>
       
    </main-layout>
</template>