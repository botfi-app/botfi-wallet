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
            
            //let opts = {
            //    staticNetwork: netInfo.chainId
            //}

            let rpc = netInfo.rpc[0]

            this.provider = new ethers.JsonRpcProvider(rpc)

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

    notConnectedError = () => Status.error("Wallet not connected")
                                .setCode(ErrorCodes.WALLET_NOT_CONNECTED)

    setWallet(privateKey) {
        if(!this.provider){
            return this.notConnectedError()
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

    async getNetwork() {

        try {

            if(!this.provider){
                return this.notConnectedError()
            }

            let { chainId: chainIdBigInt, name } = await this.provider.getNetwork()

            //console.log("netInfo==>", chainId)
            let chainId = Number(chainIdBigInt)

            return Status.successData({ chainId, name })
            
        } catch(e){
            Utils.logError("Wallet#getNetwork:", e)
            return Status.error("Failed to get network info")
        }
    }
}