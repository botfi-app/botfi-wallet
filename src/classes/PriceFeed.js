/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import app from "../config/app"
import Status from "./Status"
import Utils from "./Utils"

export default class PriceFeeds {

    static async getPythPriceFeeds() {
        try {

            let resultStatus = await Http.getJson(app.pyth_price_feed_url)

            return resultStatus
            
        } catch(e){
            Utils.logError("PriceFeeds#getAllFeeds:",e)
            return Status.errorPromise()
        }
    }

}
