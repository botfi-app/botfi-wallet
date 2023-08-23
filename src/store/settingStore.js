import { defineStore } from 'pinia'
import {ref, computed, toValue, toRaw, inject } from 'vue'
import Status from '../classes/Status';
import Settings from '../classes/Settings';


export const useSettingStore = defineStore('settingStore', () => {

    const botUtils = inject("botUtils")

    const $state = ref({
        settings:            {},   
        networkInfo:         {},
        defaultNetwork:      1
    }); 

    const getState = (k) => $state.value[k]
    const setState = (k,v) => $state.value[k] = v

    const  getSettings = async () => {

        if(Object.keys(getState("settings")).length > 0){
            return Status.successData(getState("settings"))
        }

        let settingsStatus = await Settings.getSettings(botUtils.getUid())

        if(settingsStatus.isError()){
            return settingsStatus;
        }

        let settingsData = settingsStatus.getData()

        console.log("settingsData==>", settingsData)

        setState("settings", settingsData)
        setState("networkInfo", settingsData.network_info)

        return settingsStatus;
    }


    const getNetworkInfo = async () => {
        
        if(Object.keys(getState("networkInfo")).length > 0){
            return Status.successData(getState("networkInfo"))
        }

        let settingsStatus = await getSettings()

        if(settingsStatus.isError()){
            return settingsStatus
        }

        return Status.successData(getState("networkInfo"))
    }

    return {
        getSettings,
        getNetworkInfo
    }
})