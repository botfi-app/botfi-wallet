/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */
import { defineStore } from 'pinia' 
import {ref, inject, computed, onBeforeMount } from 'vue'
import { useDB } from "../composables/useDB"
import Status from '../classes/Status';
import Utils from '../classes/Utils';
import { useNetworks } from "./useNetworks"

const $state = ref({
    activiyList: []
})

export const useActivityStore = defineStore('activityStore', () => {
    
    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")

    const activityList = computed(() => $state.value.activiyList)

    onBeforeMount(() => {
        getActivityList()
    })

    const saveActivity = async (params={}) => {

        try {
            let userId = botUtils.getUid()
            let db = await dbCore.getDB()
            let table = db.activity;

            let { 
                wallet,
                chainId, 
                contract,
                hash, 
                activityType, 
                extraInfo={} 
            } = params;

            let id = Utils.generateUID(`${userId}-${chainId}-${wallet}-${contract}-${hash}`)

            let now = Date.now()

            let oldData = await table.get(id) || null

            let dataToSave = {
                id,
                userId,
                chainId,
                wallet,
                contract,
                hash,
                activityType,
                extraInfo
            }

            if(oldData == null){
                dataToSave["createdAt"] = now
            }

            dataToSave["updatedAt"] = now

            await table.put(dataToSave)

            return Status.success() 
        }  catch(e){
            Utils.logError("activityStore#saveActivity:", e)
            return Status.errorPromise(Utils.generalErrorMsg)
        }
    }

    const getActivityList = async () => {
        try {
            
            let netInfo = await net.getActiveNetworkInfo()
            let chainId = netInfo.chainId

            let userId = botUtils.getUid()
            let db = await dbCore.getDB()

            let activityArr  =  await db.activity.where({ chainId, userId })
                                    .reverse()
                                    .sortBy("createdAt")

            $state.value.activiyList = activityArr

            return activityArr

        }   catch(e){
            Utils.logError("activityStore#saveActivity:", e)
            return []
        }
    }


    return {
        saveActivity,
        activityList,
        getActivityList
    }
})