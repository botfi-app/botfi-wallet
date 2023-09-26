/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Http from './Http'
import Status from './Status'
import appConfig from "../config/app"

export default class GeckoApi {

    static async getCoinInfo(geckoId) {
        try {

            let url = `${appConfig.gecko_api_endpoint}/coins/${geckoId}`
            let resultStatus = await Http.getJson(url)
            
            return resultStatus
        } catch(e) {
            Utils.logError("GeckoApi#getCoinInfo",e)
            return res.systemBusy()
        }
    }

}