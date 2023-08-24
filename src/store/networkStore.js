import { defineStore } from 'pinia'
import {ref, computed, inject } from 'vue'

export const useNetworkStore = defineStore('networkStore', () => {

    const botUtils = inject("botUtils")

    const $state = ref({
        userNetworkInfo:        null,
        defaultNetworkInfo:     null
    }); 

    //const userNetworkInfo  = computed(()  =>  $state.value.userNetworkInfo )

    const fetchDefaultNetworks = async (force=false) => {

        let $s = $state.value

        if(!force && $s.defaultNetworkInfo != null) {
            return $s.defaultNetworkInfo
        }

        let results = await import("/data/networks.js?url")
           
        let data = results.default;

        $s.defaultNetworkInfo = data;

        return data
    }

    const getUserNetworks = async () => {

        let uid = botUtils.getUid()
        let key = `${uid}_user_networks`
        let $s  = $state.value

        if($s.userNetworkInfo != null) {
            return $s.userNetworkInfo
        }
       
        let userNetworksStr = (localStorage.getItem(key) || "").trim()
        let userNetworkInfo;

        if(userNetworksStr != ''){
           userNetworkInfo = JSON.parse(userNetworksStr)
        } else {
            userNetworkInfo = await fetchDefaultNetworks(true)
            localStorage.setItem(key, JSON.stringify(userNetworkInfo))
        }

        //console.log("userNetworkInfo===>", userNetworkInfo)

        $s.userNetworkInfo  = userNetworkInfo

        return userNetworkInfo
    }

    return {
        getUserNetworks,
        fetchDefaultNetworks
    }
});