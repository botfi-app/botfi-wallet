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

            console.log(ewallet)
            return Status.successData(ewallet)

        } catch(e){
            Utils.logError("Wallet#generateMnemonic:", e)
            return Status.error("Failed to generate key phrase")
        }
    }

    static async encrypt(key, data) {
        try {

        } catch(e){
            Utils.logError("Wallet#encrypt:", e)
            return Status.error("Failed to generate key phrase")
        }
    }
}