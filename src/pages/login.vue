<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useRouter } from 'vue-router';
import Utils from '../classes/Utils'
import { useToast } from '../composables/useToast';

const navigator = window.navigator
const initialized = ref(false)
const toast = useToast()
const walletStore = useWalletStore()
const router      = useRouter()
const password    = ref("")

onBeforeMount(() => {
    initialize()
})

const initialize = () => {

    if(!walletStore.hasDefaultWallet()){
        router.push('/')
    }

    walletStore.logout()

    initialized.value = true 
}

const handleLogin = async () => {
    
    let pass = password.value.trim()

    if(pass == ''){
        return Utils.errorAlert("Password is required")
    }

    let loader =  Utils.loader("Decrypting wallets..")
    
    let loginStatus = await Utils.runBlocking(() => walletStore.doLogin(pass))
        
    //console.log("loginStatus===>", loginStatus)

    loader.close()

    if(loginStatus.isError()){

        let errMsg = loginStatus.getMessage()

        if(errMsg == 'default_account_not_found'){
            Utils.getSwal().fire({
                title: "Error",
                text:  "Default account was not found, create an account or import one",
                didClose: () => router.push("/")
            })

            return false
        }

        return Utils.errorAlert(errMsg)
    }

    router.push("/wallet")
}


const resetAccount = async () => {
    let action =   await Utils.getSwal().fire({
                        showCancelButton: true,
                        confirmButtonText: 'Confirm',
                        denyButtonText:     'Cancel',
                        text: `This action will delete all the acounts on the device permanently, 
                                make sure you have a backup of your seed phrase to restore the accounts`,
                        title: "Reset Account?"
                    })
    
    if(!action.isConfirmed){
        return false;
    }

    let resetStatus = await walletStore.resetAccount()

    if(resetStatus.isError()){
        return Utils.mAlert(resetStatus.getMessage())
    }

    Utils.showToast("Account reset completed")

    router.push("/")
}
</script>
<template>
    <main-layout 
        :showBackBtn="false"
        title="BotFi Wallet"
        :centerTitle="true"
        v-if="initialized"
    >
       
        <k-block strong inset class="max-w400">
            <div class="flex flex-col w-full items-center">
            
                <div class="flex justify-center">
                    <img 
                        src="/images/svg/logo.svg" 
                        class="logo mt-5 animate__animated animate__pulse animate__slow animate__infinite	infinite" 
                        alt="" 
                    />
                </div>

                <k-list  class="p-0 w-full">
                    <k-list-input
                        label="Password"
                        floating-label
                        type="password"
                        placeholder="Enter Password"
                        @input="e=> password = e.target.value"
                        class="mx-0"
                    />
                </k-list>

                <div class="mb-5 flex flex-col items-center w-full">
                    <k-button rounded raised large 
                        class="btn mb-5"
                        @click.prevent="handleLogin"
                    >
                        Login
                    </k-button>
                    <k-button  rounded  raised large 
                        class="k-color-secondary btn mb-5"
                        @click="resetAccount"
                    >
                        Reset Account
                    </k-button>
                </div>
            </div>
        </k-block>
    </main-layout>
</template>
