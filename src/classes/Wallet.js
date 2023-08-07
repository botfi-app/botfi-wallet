/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Status from "./Status"
import Utils from "./Utils"
import {   Wallet as ethersWallet } from "ethers"

export default class Wallet {

    static async createWallet(password) {
        try {

            let walletInfo = ethersWallet.createRandom()

            return Status.successData(walletInfo)

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