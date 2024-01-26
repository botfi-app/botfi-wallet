/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, computed, inject } from "vue"
import Status from "../classes/Status"
import { useDB } from "./useDB"
import Utils from "../classes/Utils"

const $settings = ref({})

export const useSettings = () => {

    
    const defaultSettings = {
        defaultCurrency: 'usd'
    }

    const dbCore = useDB()
    const botUtils = inject("botUtils")

    console.log("botUtils===>", botUtils)

    const settings = computed(() => $settings.value )

    onBeforeMount(() => {
        $settings.value = defaultSettings
        fetchSettings()
    })

    const fetchSettings = async () => {
        
        let userId = botUtils.getUid()

        let db = await dbCore.getDB()

        let _settings = (await db.settings.get({ userId }))

        let data = (!_settings || _settings == null) 
                    ?  defaultSettings
                    :  { ...defaultSettings, ...(_settings.data || {}) }
            
        $settings.value = data;

        return data;
    }

    const saveSettings = async (key, value) => {
        try {

            let db = await dbCore.getDB()

            let userId = botUtils.getUid()
            
            let _settings = (await db.settings.get({ userId }))

            let isNew = (!_settings || _settings == null)

            //settings[key] = value
            //settings[userId] = userId

            if(isNew) {
                _settings = { userId, data: {} }
            }
            
            _settings.data = {..._settings.data, [key]: value }
            _settings.updatedAt = new Date;

            await db.settings.put(_settings)

            await fetchSettings()

            return Status.success("Settings saved")
        } catch(e){
            Utils.logError("useSettings#saveSettings:", e)
            return Status.error("Failed to update settings")
        }
    }

    return {
        fetchSettings,
        settings,
        saveSettings
    }
}