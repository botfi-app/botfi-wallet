/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Status from "./Status"
import { Wallet as ethersWallet } from "ethers"

export default class Wallet {

    static async generateMnemonic() {
        try {

            let ewallet = ethersWallet.createRandom()
            const words = ewallet.mnemonic.phrase

            console.log(ewallet)
            return Status.successData(ewallet)

        } catch(e){
            Utils.logError("Wallet#generateMnemonic:", e)
            return Status.error("failed to generate key phrase")
        }
    }
}