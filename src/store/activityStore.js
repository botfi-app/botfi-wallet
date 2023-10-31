import { defineStore } from 'pinia'
import {ref, computed, toValue, toRaw, inject, onBeforeMount } from 'vue'
import Status from '../classes/Status';
import Wallet from '../classes/Wallet';
import { useKeystore } from '../composables/useKeyStore';

const $state = ref({
    tokens: {},
    dataState: Date.now()
})


export const useActivityStore = defineStore('activityStore', () => {

    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")
    const { fetchSettings } = useSettings()
    const { getWalletAddresses } = useWalletStore()
    

    const saveActivity = async ({ wallet ,chainId, type, extraInfo={} }) => {

        let userId = botUtils.getUid()

        let db = await dbCore.getDB()

        
    }

})