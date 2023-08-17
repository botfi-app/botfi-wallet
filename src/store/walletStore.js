import { defineStore } from 'pinia'
import {ref, computed, toValue, toRaw, inject } from 'vue'
import Status from '../classes/Status';
///import Wallet from '../classes/Wallet';
import KeyStore from '../classes/keyStore';


export const useWalletStore = defineStore('walletStore', () => {

    const botUtils = inject("botUtils")

    const $state = ref({
        password:         "",
        defaultWallet:    null,
        accounts:            {}
    }); 


    const defaultWallet     = computed(()       =>    $state.value.defaultWallet )
    const accounts          = computed(()       =>    $state.value.accounts )
    const password          = computed(()       =>    $state.value.password )
    const processedPass     = computed(()       =>    processPassword($state.value.password) )
    
    const setPassword = (pass) => {
        $state.value.password = pass
    }

    const getUserInfo = () => {
        return botUtils.getUserInfo()
    }
    
    const processPassword = (_pass="") => {

        _pass = toValue(_pass).toString().trim()

        //console.log("_pass===>2", _pass)

        if(_pass == '' ) return _pass
        
        let userInfo = botUtils.getUserInfo()

        if(userInfo == null) return _pass

        return `${botUtils.botPlatform}_${userInfo.id}_${_pass}`
    }

    const getPassword = async () => {
        return password.value.toString().trim()
    }
    
    const doLogin = async (pass) => {
        
        let _ppass = processPassword(pass)

        let userId = getUserInfo().id;

        let defaultWalletStatus = await KeyStore.getDefaultWallet(userId, _ppass)
        
        if(defaultWalletStatus.isError()){

            let errMsg = defaultWalletStatus.getMessage()

            if(errMsg == 'wallet_decryption_failed'){
                return Status.errorPromise("Failed to decrypt wallet, check password")
            }

            return defaultWalletStatus
        }

        $state.value.defaultWallet = defaultWalletStatus.getData()

        // lets now fetch the accounts
        let accountsStatus = await KeyStore.getAccounts(userId, _ppass)

        if(accountsStatus.isError()){
            return accountsStatus
        }

        $state.value.accounts = accountsStatus.getData()

        $state.value.password = pass;

        ///savePasswordToManager(pass)
      
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
        return KeyStore.hasDefaultWallet(getUserInfo().id)
    }

    const saveDefaultWallet = async (_walletInfo) => {
        
        let userId = getUserInfo().id;

        let saveStatus = await KeyStore.saveDefaultWallet(
                            userId,
                            processPassword(password), 
                            toRaw(_walletInfo)
                        )

        if(saveStatus.isError()){
            return saveStatus
        }

        $state.defaultWallet = saveStatus.getData()
        updateAccounts();

        return saveStatus
    }

    const updateAccounts = async () => {
        
        let pass = processPassword(toValue(password))

        
        if(pass == "") {
            return Status.error("Pasword is required")
        }

        let userId = getUserInfo().id;

        let accountsStatus = await KeyStore.getAccounts(userId, toValue(pass))

        if(accountsStatus.isError()){
            return accountsStatus
        }

        $state.accounts = accountsStatus.getData()

        return accountsStatus
    }

    const resetAccount = async () => {

        let userId = getUserInfo().id;

        await KeyStore.resetAccount(userId)
        
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
        getPassword,
        setPassword,
        doLogin,
        isLoggedIn,
        resetAccount,
        logout
    }
})