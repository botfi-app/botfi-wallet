import { defineStore } from 'pinia'
import {ref, computed, toValue, toRaw } from 'vue'
import Status from '../classes/Status';
import Wallet from '../classes/Wallet';
import KeyStore from '../classes/keyStore';


export const useWalletStore = defineStore('walletStore', () => {

    const $state = ref({
        password:         "",
        defaultWallet:    null,
        accounts:            {}
    }); 


    const defaultWallet     = computed(()        =>   $state.value.defaultWallet )
    const accounts          = computed(()       =>    $state.value.keys )
    const password          = computed(()       =>    $state.value.value )

    const setPassword = (pass) => {
        _password.value = pass
    }

    const doLogin = async (pass) => {
        
        let defaultWalletStatus = await KeyStore.getDefaultWallet(toValue(pass))
        
        if(defaultWalletStatus.isError()){

            let errMsg = defaultWalletStatus.getMessage()

            if(errMsg == 'wallet_decryption_failed'){
                return Status.errorPromise("Failed to decrypt wallet, check password")
            }

            return defaultWalletStatus
        }

        $state.value.defaultWallet = defaultWalletStatus.getData()

        // lets now fetch the accounts
        let accountsStatus = await KeyStore.getAccounts(toValue(pass))

        if(accountsStatus.isError()){
            return accountsStatus
        }

        $state.value.accounts = accountsStatus.getData()

        $state.value.password = pass;

        return Status.successPromise()
    } //end do login 

    const isLoggedIn = () => {
        return (password.value != '' && 
            defaultWallet.value != null && 
            Object.keys(accounts.value).length > 0
        )
    }

    const logout = () => {
        $state.value = {
            password: '',
            defaultWallet: null,
            accounts: {}
        }

       return Status.success()
    }

    const hasDefaultWallet = () => {
        return KeyStore.hasDefaultWallet()
    }

    const saveDefaultWallet = async (_walletInfo) => {
        
        let saveStatus = await KeyStore.saveDefaultWallet(toValue(password), toRaw(_walletInfo))

        if(saveStatus.isError()){
            return saveStatus
        }

        $state.defaultWallet = saveStatus.getData()
        updateAccounts();

        return saveStatus
    }

    const updateAccounts = async () => {
        
        let pass = toValue(password)

        if(pass == "") {
            return Status.error("password_required")
        }

        let accountsStatus = await KeyStore.getAccounts(pass)

        if(accountsStatus.isError()){
            return accountsStatus
        }

        $state.accounts = accountsStatus.getData()

        return accountsStatus
    }

    const resetAccount = async () => {

         await KeyStore.resetAccount()
        
        $state.value = {
            accounts: {},
            defaultWallet: null 
        }

        return Status.success()
    }

    return {
        hasDefaultWallet,
        updateAccounts,
        accounts,
        defaultWallet,
        saveDefaultWallet,
        password,
        setPassword,
        doLogin,
        isLoggedIn,
        resetAccount,
        logout
    }
})