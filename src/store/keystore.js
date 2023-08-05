import { defineStore } from 'pinia'
import {ref, computed, reactive, watch } from 'vue'
import Status from '../classes/Status';
import KeyStore from '../classes/KeyStore';

const localStore = window.localStorage;

export const useKeyStore = defineStore('keystore', () => {

    const _password = ref("")

    const $state = ref({
        seedPhraseInfo:  {},
        keys:            []
    }); 


    const seedPhraseInfo    = computed(()       =>    $state.value.seedPhrase )
    const keys              = computed(()       =>    $state.value.keys )
    const password          = computed(()       =>    _password.value )

    const setPassword = (pass) => {
        _password.value = pass
    }

    const getDefaultWallet = () => {
        return KeyStore.getDefaultWallet(password)
    }

    const hasDefaultWallet = () => {
        return KeyStore.hasDefaultWallet()
    }

    const saveDefaultWallet = async (_seedPhraseInfo) => {
        return KeyStore.saveDefaultWallet(password, _seedPhraseInfo)
    }

    const getAccounts = async (password) => {
        if(password == "") {
            return Status.error("password_required")
        }
    }

    return {
        hasDefaultWallet,
        getAccounts,
        getDefaultWallet,
        saveDefaultWallet,
        password,
        setPassword
    }
})