import { defineStore } from 'pinia'
import {ref, computed, toValue } from 'vue'
import Status from '../classes/Status';
import keyStore from '../classes/keyStore';

export const useWalletStore = defineStore('walletStore', () => {

    const _password = ref("")

    const $state = ref({
        defaultWallet:    null,
        accounts:            []
    }); 


    const defaultWallet     = computed(()        =>   $state.value.defaultWallet )
    const accounts          = computed(()       =>    $state.value.keys )
    const password          = computed(()       =>    _password.value )

    const setPassword = (pass) => {
        _password.value = pass
    }

    const getDefaultWallet = async () => {

        if(defaultWallet.value == null){
            
            let defaultWalletStatus = await keyStore.getDefaultWallet(toValue(password))
            
            let _walletInfo = defaultWalletStatus.getData()

            if(defaultWalletStatus.isError() || _walletInfo == null){
                return defaultWalletStatus
            }
          
            $state.value.defaultWallet = _walletInfo
        }

        return $state.value.defaultWallet
    }


    const hasDefaultWallet = () => {
        return keyStore.hasDefaultWallet()
    }

    const saveDefaultWallet = async (_walletInfo) => {
        
        let saveStatus = await keyStore.saveDefaultWallet(toValue(password), toValue(_walletInfo))

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

        let accountsStatus = await keyStore.getAccounts(pass)

        if(accountsStatus.isError()){
            return accountsStatus
        }

        $state.accounts = accountsStatus.getData()

        return accountsStatus
    }

    return {
        hasDefaultWallet,
        updateAccounts,
        accounts,
        getDefaultWallet,
        saveDefaultWallet,
        password,
        setPassword
    }
})