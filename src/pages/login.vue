<script setup>
import { inject, onBeforeMount, ref, watch } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useRouter } from 'vue-router';
import Utils from '../classes/Utils'
import { useToast } from '../composables/useToast';
import Pincode from '../components/common/Pincode.vue';

const initialized = ref(false)
const walletStore = useWalletStore()
const router      = useRouter()
const pin         = ref("")

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
    
    let p = pin.value.toString().trim()

    console.log(p)

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


const resetAccount = async () => {
    let action =   await Utils.getSwal().fire({
                        showCancelButton: true,
                        confirmButtonText: 'Confirm',
                        denyButtonText:     'Cancel',
                        text: `This action will delete all the acounts on the device permanently, 
                                make sure you have a backup of your seed phrase to restore the accounts`,
                        title: "Reset Account?",
                        focusCancel: true,
                        customClass: {
                            confirmButton: "btn btn-lg px-5 btn-danger mx-1 rounded-pill",
                            cancelButton: "btn btn-lg px-5 btn-info mx-1 rounded-pill shadow-lg"
                        }

                    })
    
    if(!action.isConfirmed){
        return false;
    }

    let resetStatus = await walletStore.resetAccount()

    if(resetStatus.isError()){
        return Utils.mAlert(resetStatus.getMessage())
    }

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
                <Pincode 
                    label="Enter Pin"
                    @change="(v) => pin = v"
                />
            </div>

            <div class="my-5 px-5 d-flex flex-column align-items-center w-full">
                <button
                    class="btn btn-lg w-full  rounded-pill shadow btn-primary mb-4"
                    @click.prevent="handleLogin"
                >
                    Login
                </button>
                <button 
                    class="btn-none text-danger w-full btn mb-2"
                    @click="resetAccount"
                >
                    Reset Account
                </button>
            </div>
        </div>
    </main-layout>
</template>
