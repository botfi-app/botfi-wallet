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

import { inject, onBeforeMount, onMounted, ref, watch } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useTokens } from "../composables/useTokens"
import { useActivity } from "../composables/useActivity"
import { useNFT } from "../composables/useNFT"
import { useRouter, useRoute } from 'vue-router';
import Utils from '../classes/Utils'
import PinCode from '../components/common/PinCode.vue';
import { useBiometricAuth } from '../composables/useBiometricAuth';

const initialized = ref(false)
const walletStore = useWalletStore()
const router      = useRouter()
const pin         = ref("")
const { removeUsersTokensAndBalances } = useTokens()
const { removeUserActivity } = useActivity()
const { removeUserNFTs } = useNFT()
const route = useRoute()
const bAuth = useBiometricAuth()
const unlockWithBiometric = ref(true)
const supportsBiometricAuth = ref(false)
const biometricUnlockEnabled = ref(false)
const bAuthRetries = ref(0)
const biometricAuthError = ref("")

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

    initialized.value = true  
}

onMounted(() => {
    handleBiometricAuth(false)
})

const handleBiometricAuth = async (silent=false) => {
      
    supportsBiometricAuth.value = await bAuth.isSupported()
    biometricUnlockEnabled.value = await bAuth.isBiometricAuthEnabled()

    //console.log("supportsBiometricAuth===>",supportsBiometricAuth.value)
    //console.log("biometricUnlockEnabled===>", biometricUnlockEnabled.value)

    if(!supportsBiometricAuth.value) return;

    if(biometricUnlockEnabled.value){

        bAuthRetries.value += 1
        biometricAuthError.value = ''

        // first lets authenticate user first 
        let authStatus = await bAuth.verifyIdentity()

        //console.log("isAuthenticated===>", isAuthenticated)

        if(authStatus.isError()){

            let errCode = authStatus.code

            if([1,2,3,4].includes(errCode) ||  bAuthRetries.value >= 5) {
                biometricUnlockEnabled.value = false
                bAuth.clearBiometricAuth()
            }

            biometricAuthError.value = 'Biometric auth failed: '+authStatus.getMessage()

            return false; 
        }

        let credDataStatus = await bAuth.getCredential(bAuth.authServerName)

        //console.log("credDataStatus===>", credDataStatus)
 
        if(credDataStatus.isError()){
            if(!silent) Utils.mAlert(credDataStatus.getMessage())
            return;
        }
        
        let credential = credDataStatus.getData() || { password: ""}

        let password = credential.password;

        if(password.length == '') return;

        pin.value = password
        await handleLogin(silent)
    }

}

const handleLogin = async (silent=false) => {
    
    let p = pin.value.toString().trim()

    if(p == ''){
        if(!silent) Utils.errorAlert("Pin code is required")
        return false;
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

    if(supportsBiometricAuth.value){
        if(!biometricUnlockEnabled.value){
            
            if(unlockWithBiometric) {
                // first lets authenticate user first 
                let authStatus = await bAuth.verifyIdentity()

                if(!authStatus.isError()){
                    await bAuth.enableBiometricAuth(p)
                }
            }
        } else {
            if(!unlockWithBiometric) await bAuth.clearBiometricAuth()
        }
    } //end if biometric is supported

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
            
            <top-logo class="mt-5" />

            <div class="p-3 w-full mt-5 d-block">
                <PinCode 
                    label="Enter Pin"
                    @change="(v) => pin = v"
                />
              
                <div class="biometric-btn">
                    <a href="#" v-if="biometricUnlockEnabled" 
                        @click.prevent="handleBiometricAuth"
                        class="btn btn-none p-0 m-0"
                    >
                        <Icon name="material-symbols:fingerprint" :size="32" />
                    </a>
                </div>
            </div>

            <div v-if="biometricAuthError != ''" class="px-3 fs-12 fw-medium text-danger my-1">
                {{ biometricAuthError }}
            </div>

            <div v-if="supportsBiometricAuth"
                class="p-3 w-full my-1 mb-3 d-flex align-items-center"
            >
                <label for="unlockWithBiometric" class="me-2" id="">Unlock with Biometric?</label>
                <div class="form-check form-switch">
                    <input 
                        class="form-check-input rounded-pill" 
                        type="checkbox" 
                        role="switch" 
                        id="unlockWithBiometric" 
                        checked
                        v-model="unlockWithBiometric"
                    />
                </div>
            </div>
            <div class="mb-2 px-3 d-flex flex-column align-items-center w-full">
                <button
                    class="btn w-full rounded shadow btn-primary mb-4"
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
<style lang="scss">
.biometric-btn {
    position: absolute;
    right: 0;
    margin-right: 25px;
    margin-top: -44px;
}
</style>