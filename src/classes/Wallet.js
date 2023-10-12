/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import ErrorCodes from "./ErrorCodes"
import Status from "./Status"
import Utils from "./Utils"
import { ethers, Wallet as ethersWallet } from "ethers"
import { 
    Contract as ethcallContract, 
    Provider as ethcallProviderClazz
} from 'ethcall';

export default class Wallet {

    provider = null
    signer   = null
    chainId  = null
    netInfo  = null  

    async connect (netInfo, wallet = null) {

        try {
            
            //let opts = {
            //    staticNetwork: netInfo.chainId
            //}
            this.netInfo = netInfo
            this.chainId = netInfo.chainId;

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


    async staticMulticall(inputsArray) {
        try {

            let labels = []
            let inputs = []

            const ethcallProvider = new ethcallProviderClazz(this.chainId, this.provider);

            for(let index in inputsArray){
                
                let item = inputsArray[index]

                labels[index] = item.label;

                // if its eth native balance, then use
                if(item.method == 'getEthBalance') {
                    inputs[index] = ethcallProvider.getEthBalance(item.args[0])
                } else {
                    let contract = new ethcallContract(item.target, item.abi)
                    inputs[index] = contract[item.method](...item.args)
                }
            }

            const dataArray = await ethcallProvider.all(inputs, {blockTag: 'latest'});
            
            let processedData = {}

            for(let index in dataArray){
                processedData[labels[index]] = dataArray[index]
            }

            //console.log("processedData==>", processedData)

            return Status.successData(processedData)
        } catch(e){
            Utils.logError("Wallet#deploylessMuticall:", e)
            return Status.error("onchain operation failed")
        }
    }

    /**
     * get a contract's code
     * @param {*} contractAddress 
     * @param {*} proxyCheck 
     * @returns 
     */
    async getCode(contractAddress, proxyCheck = true) {
         
        if(!this.provider){
            return this.notConnectedError()
        }

         
        let code = await this.provider.getCode(contractAddress);

        if(code == '0x') return Status.error("Address not a contract")

        let proxySlots = {
           "tranparent": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
            "beacon": "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50",
           "eip-1822": "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
        }

        let implAddress;

        let tProxySlot = proxySlots["tranparent"]
            
        if (code.includes(tProxySlot.substring(2))) {
            implAddress = await this.getProxyImplFromStorage(
                            contractAddress,
                            tProxySlot
                        )
        } 

        let bProxySlot = proxySlots["beacon"]

        
        if ((!implAddress || implAddress == Utils.zeroAddress) &&
            code.includes(bProxySlot.substring(2))
        ) {
            let beaconAddr = await this.getProxyImplFromStorage(
                                contractAddress,
                                bProxySlot
            )
            
            implAddress = await this.getBeaconProxyImpl(beaconAddr)
        }
      
        //console.log("implAddress===>", "===>", implAddress)
            
        if (implAddress &&
            ethersUtils.isAddress(implAddress) &&
            implAddress != Utils.zeroAddress
        ) {
            code = await this.provider.getCode(implAddress);
        }
        
        return Status.successData(code)
    }

    /**
     * check if a contract code contains a method by signature
     * @param {*} contractAddr the contract's address 
     * @param {*} signature 
     * @param {*} code 
     * @returns 
     */
    async hasMethod(contractAddr, signature, code) {
        
        if(!code){
            code = await this.getCode(contractAddr)
        }

        const hash = this.encodeSig(signature);
      
        return code.includes(hash.substring(2));
    }

}