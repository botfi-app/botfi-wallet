/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { useRoute,  useRouter } from "vue-router";

export default class Utils {

    static logError(msg, err){
        console.log(msg, err)
    }
}