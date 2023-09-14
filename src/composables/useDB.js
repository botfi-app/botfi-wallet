/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import dbConfig from "../config/db"
import appConfig from "../config/app";
import { inject, onBeforeMount } from "vue"
import Dexie from "dexie";

export const useDB = () => {

   // const botUtils = inject("botUtils")
    let db = null;

    const _initDB = async() => {
        db = new Dexie("./db")
        db.version(dbConfig.version)
          .stores(dbConfig.schema)
    }

    onBeforeMount(() => {
        _initDB()
    })

    const getDB = async () => {
        if(db == null){
            await _initDB()
        }

        if(appConfig.is_dev){
            //await db.upgrade()
        }

        return db;
    }

    return {
        getDB
    }
}