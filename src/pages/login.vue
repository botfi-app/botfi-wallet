<route>
    { 
      name: "login", 
      path: "/login" 
    }
</route>
<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { inject, onBeforeMount, ref, watch } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useTokens } from "../composables/useTokens"
import { useActivity } from "../composables/useActivity"
import { useNFT } from "../composables/useNFT"
import { useRouter, useRoute } from 'vue-router';
import Utils from '../classes/Utils'
import PinCode from '../components/common/PinCode.vue';

const initialized = ref(false)
const walletStore = useWalletStore()
const router      = useRouter()
const pin         = ref("")
const { removeUsersTokensAndBalances } = useTokens()
const { removeUserActivity } = useActivity()
const { removeUserNFTs } = useNFT()
const route = useRoute()

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    if(!(await walletStore.hasDefaultWallet())){
        router.push('/')
    }
    
    if(walletStore.isLoggedIn()){
       return redirectLoggedIn()
    }

    ///walletStore.logout()

    initialized.value = true 
}

const handleLogin = async () => {
    
    let p = pin.value.toString().trim()

    if(p == '' || p.length < 4){
        return Utils.errorAlert("Pin code is required")
    }

    let loader =  Utils.loader("Decrypting wallets..")

    p = parseInt(p)
    
    let loginStatus = await Utils.runBlocking(() => walletStore.doLogin(p))
        
    loader.close()

    if(loginStatus.isError()){

        let errMsg = loginStatus.getMessage()

        if(errMsg == 'default_account_not_found'){
            Utils.mAlert(
                "Default account was not found, create an account or import one",
                () => router.push("/")
            )

            return false
        }

        return Utils.errorAlert(errMsg)
    }

    redirectLoggedIn()
}

const redirectLoggedIn = () => {

    let nextPage = route.query.next || "" 
    
    //console.log(" route.query===>",  route.query)

    let whitelistUrls = [
        "swap",
        "settings", 
        "bridge", 
        "tokens", 
        "nft",
        "scanner"
    ]

    let url = (whitelistUrls.includes(nextPage))
                ? `/${nextPage}`
                : "/wallet"

    ///console.log("url===>", url)

    router.push(url)
}

const resetWallets = async () => {
    let action =   await Utils.getSwal().fire({
                        showCancelButton: true,
                        confirmButtonText: 'Confirm',
                        denyButtonText:     'Cancel',
                        text: `This action will delete all the wallets on the device permanently, 
                                make sure you have a backup of your seed phrase to restore the wallets`,
                        title: "Reset Wallets?",
                        focusCancel: true,
                        customClass: {
                            confirmButton: "btn px-5 btn-danger mx-1 rounded-pill",
                            cancelButton: "btn px-5 btn-info mx-1 rounded-pill shadow-lg"
                        }

                    })
    
    if(!action.isConfirmed){
        return false;
    }

    let resetStatus = await walletStore.resetWallets()

    if(resetStatus.isError()){
        return Utils.mAlert(resetStatus.getMessage())
    }

    await removeUsersTokensAndBalances()
    await removeUserActivity()
    await removeUserNFTs()

    Utils.toast("Reset completed")

    router.push("/")
}

</script>
<template>
    <main-layout 
        :has-back-btn="false"
        title="Login"
        :center-content="true"
        v-if="initialized"
    >
       
        <div class="d-flex flex-column w-400  align-items-center">

            <top-logo />

            <div class="p-3 w-full">
                <PinCode 
                    label="Enter Pin"
                    @change="(v) => pin = v"
                />
            </div>

            <div class="mb-2 px-3 d-flex flex-column align-items-center w-full">
                <button
                    class="btn btn-lg w-full  rounded shadow btn-primary mb-4"
                    @click.prevent="handleLogin"
                >
                    Login
                </button>
                <button 
                    class="btn-none btn-lg text-danger w-full btn btn-md mb-2"
                    @click="resetWallets"
                >
                    Reset Wallets
                </button>
            </div>
        </div>
    </main-layout>
</template>
