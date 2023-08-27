/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import ErrorCodes from "./ErrorCodes"
import Status from "./Status"
import Utils from "./Utils"
import { ethers, Wallet as ethersWallet } from "ethers"

export default class Wallet {

    provider = null
    signer   = null

    async connect (netInfo, wallet = null) {

        try {
            
            let opts = {
                staticNetwork: netInfo.chainId
            }

            //console.log("netInfo===>", netInfo)

            let rpc = netInfo.rpc[0]

            this.provider = new ethers.JsonRpcProvider(rpc, null, opts)

            if(wallet != null){
                let setWalletStatus = await this.setWallet(wallet)

                if(setWalletStatus.isError()){
                    return setWalletStatus
                }
            }

            // lets fetch the block to show that the rpc works 
            let blockNo = await this.provider.getBlockNumber()

            if(!blockNo || typeof blockNo != 'number'){
                Status.error("Failed to connect to network's rpc")
                      .setCode(ErrorCodes.RPC_CONNECT_FAILED)
            }

            //console.log("blockNo===>", blockNo)

            return Status.successData(this)

        } catch(e){
            Utils.logError("Wallet#connect:", e)
            return Status.error("Failed to connect to network's rpc")
                         .setCode(ErrorCodes.RPC_CONNECT_FAILED)
        }
    }


    setWallet(privateKey) {
        if(!this.provider){
            return Status.errorPromise("Wallet not initialized")
        }

        this.signer = new ethersWallet(privateKey, this.provider)
        
        return Status.successData(this)
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