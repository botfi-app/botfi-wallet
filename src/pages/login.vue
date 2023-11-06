<script setup>
import { inject, onBeforeMount, ref, watch } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useTokens } from "../composables/useTokens"
import { useActivity } from "../composables/useActivity"
import { useNFT } from "../composables/useNFT"
import { useRouter } from 'vue-router';
import Utils from '../classes/Utils'
import PinCode from '../components/common/PinCode.vue';

const initialized = ref(false)
const walletStore = useWalletStore()
const router      = useRouter()
const pin         = ref("")
const { removeUsersTokensAndBalances } = useTokens()
const { removeUserActivity } = useActivity()
const { removeAllUserNFTs } = useNFT()

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    if(!(await walletStore.hasDefaultWallet())){
        router.push('/')
    }

    walletStore.logout()

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

    router.push("/wallet")
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
    await removeAllUserNFTs()

    Utils.toast("Account reset completed")

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

            <div class="mt-3">
                <PinCode 
                    label="Enter Pin"
                    @change="(v) => pin = v"
                />
            </div>

            <div class="my-5 px-5 d-flex flex-column align-items-center w-full">
                <button
                    class="btn w-full  rounded-pill shadow btn-primary mb-4"
                    @click.prevent="handleLogin"
                >
                    Login
                </button>
                <button 
                    class="btn-none text-danger w-full btn btn-md mb-2"
                    @click="resetWallets"
                >
                    Reset Wallets
                </button>
            </div>
        </div>
    </main-layout>
</template>
