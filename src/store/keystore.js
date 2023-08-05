import { defineStore } from 'pinia'
import {ref, computed, reactive, watch } from 'vue'
import Status from '../classes/Status';
import KeyStore from '../classes/KeyStore';

const localStore = window.localStorage;

export const useKeyStore = defineStore('keystore', () => {

    const _password = ref("")

    const $state = ref({
        mnemonic:    [],
        keys:        []
    }); 


    const mnemonic  = computed(()       =>    $state.value.mnemonic )
    const keys      = computed(()       =>    $state.value.keys )
    const password  = computed(()       =>    _password.value )

    const setPassword = (pass) => {
        _password.value = pass
    }

    const getMnemonic = () => {
        return KeyStore.getMnemonic(password)
    }

    const hasMnemonic = () => {
        return (localStore.getItem("mnemonic") || "").length > 0;
    }

    const getAccounts = async (password) => {
        if(password == "") {
            return Status.error("password_required")
        }
    }

    return {
        hasMnemonic,
        getAccounts,
        getMnemonic,
        password,
        setPassword
    }
})