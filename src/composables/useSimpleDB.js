/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { inject } from "vue"

export const useSimpleDB = () => {
    
    const botUtils = inject("botUtils")
    const _db = localStorage//botUtils.DB()

    //console.log("_db===>", _db)

    const getKey = (key) => `${botUtils.getUid()}_${key}`

    const setItem = async (key, value) => {
        
        let _k = getKey(key)
        let _v = JSON.stringify({ d: value })

        await _db.setItem(_k, _v)  

        return true 
    }

    const getItem = async (key) => {

        let _k = getKey(key)
        
        let _v = await _db.getItem(_k) || null 

        //console.log("_v===>", _v)
   
        if(_v == null) return null;

        return JSON.parse(_v).d;
    }

    const removeItem = async (key) => {
        let _k = getKey(key)
        await _db.removeItem(_k)
    }


    return { setItem, getItem, removeItem }
}