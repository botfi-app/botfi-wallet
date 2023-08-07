/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Status from "./Status"
import Utils from "./Utils"
import {  Mnemonic, HDNodeWallet, randomBytes } from "ethers"

export default class Wallet {

    static async createWallet(password) {
        try {

            const mnemonic = Mnemonic.fromEntropy(randomBytes(16), password)

            let ewallet = HDNodeWallet.fromMnemonic(mnemonic)
            
            let result = JSON.parse(JSON.stringify(ewallet))

            result["privateKey"] = ewallet.privateKey 

            //console.log("result===>", result)

            return Status.successData(result)

        } catch(e){
            Utils.logError("Wallet#generateMnemonic:", e)
            return Status.error("Failed to generate key phrase")
        }
    }

    static async encryptWallet(password, walletInfo, isDefaultWallet = false) {
        try {

            
            //localStorage.setItem()
        } catch(e){
            Utils.logError("Wallet#encrypt:", e)
            return Status.error("Failed to generate key phrase")
        }
    }
}