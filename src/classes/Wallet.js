/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Status from "./Status"
import Utils from "./Utils"
import ethers, {   Wallet as ethersWallet } from "ethers"

export default class Wallet {

    connect (rpcUrl) {

        try {
            let provider = new ethers.JsonRpcProvider(rpcUrl)
        } catch(e){
            Utils.logError("")
        }
    }

    static async createWallet() {
        try {

            let walletInfo = ethersWallet.createRandom()

            return Status.successData(walletInfo)

        } catch(e){
            Utils.logError("Wallet#generateMnemonic:", e)
            return Status.error("Failed to generate key phrase")
        }
    }

}