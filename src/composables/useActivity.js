/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import {ref, inject, computed, onBeforeMount, onBeforeUnmount } from 'vue'
import { useDB } from "./useDB"
import Status from '../classes/Status';
import Utils from '../classes/Utils';
import { useNetworks } from "./useNetworks"
import EventBus from '../classes/EventBus';

const $state = ref({
    activiyList: []
})

export const useActivity =  () => {
    
    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")

    const activityList = computed(() => $state.value.activiyList)

    onBeforeMount(() => {
        getActivityList()
        EventBus.on("balance-updated", () => getActivityList() )
    })

    onBeforeUnmount(()=> {
        EventBus.off("balance-updated")
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
                title,
                titleParams={},
                hash, 
                activityType,
                txDate, 
                extraInfo={} 
            } = params;

            // chain tx are in seconds
            if(txDate){
                txDate = txDate * 1000;
            }

            let id = Utils.generateUID(`${userId}-${chainId}-${wallet}-${contract}-${hash}`)

            let now = Date.now()

            let oldData = await table.get(id) || null

            let dataToSave = {
                id,
                userId,
                chainId,
                wallet,
                contract,
                title,
                titleParams,
                hash,
                activityType,
                extraInfo,
                txDate
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

    const removeUserActivity = async () => {
        
        let userId = botUtils.getUid()
        let db = await dbCore.getDB()

        await db.activity.where({ userId }).delete()

        return Status.success()
    }

    return {
        saveActivity,
        activityList,
        getActivityList,
        removeUserActivity
    }
}