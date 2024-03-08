/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref, computed, toValue } from "vue"
import Status from "../classes/Status"
import { useSimpleDB } from "./useSimpleDB"
import browser from "../config/browser"

const $state = ref({
    history: []
})

export const useBrowserHistory = () => {

    const db = useSimpleDB()

    onBeforeMount(async ()=>{
        await getAll()
    })

    const historyItems = computed(() => $state.value.history )
   
    const save = async ({ title = "", url="" }) => {
        
        if(url.trim() == "" || 
           url == browser.homepage ||
           !/^(https?:\/\/)/i.test(url)
        ) return;

        //console.log("Hellooo ===>", 1000)

        //lets get history item 
        let historyArr = await getAll()

        // check if url exists, remove it 
        for(let i in historyArr){

            try {
                let item = historyArr[i] || null 

                console.log("item=====>", item)

                if(typeof item != 'object' || item == null){
                    delete historyArr[i]
                }

                if(item.url == url){
                    delete historyArr[i]
                    break;
                }
            } catch(e){
                delete historyArr[i]
            }
        }

        historyArr.unshift({ title, url })

        //lets save only last 100 records 
        historyArr = historyArr.slice(0,99)

        await db.setItem("browserHistory", JSON.stringify(historyArr))

        //console.log("historyArr=====>", historyArr)

        $state.value.history = historyArr
    }

    const getAll = async () => {

        let dataStr = await db.getItem("browserHistory") || "[]"
        let dataJsonArr = JSON.parse(dataStr)

        $state.value.history = dataJsonArr

        return dataJsonArr
    }

    return {
        save,
        history: historyItems,
        getAll
    }
}