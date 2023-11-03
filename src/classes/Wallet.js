/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import ErrorCodes from "./ErrorCodes"
import Status from "./Status"
import Utils from "./Utils"
import { 
    ethers, 
    Wallet as ethersWallet, 
    getAddress,
    Contract as ethersContract,
    id as ethersId,
    Interface,
    isAddress,
    ZeroAddress
} from "ethers"
import { 
    Contract as ethcallContract, 
    Provider as ethcallProviderClazz
} from 'ethcall';

//import { Buffer } from "buffer/";

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

                //console.log("item.method=====>", item.method)

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
     * get proxy implementation address from storage
     * @param {*} address 
     * @param {*} slot 
     * @returns 
     */
    async getProxyImplFromStorage(address, slot) {
        ///let slot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        let data = await this.provider.getStorage(address, slot);
        return this.parseAddressFromStorage(data)
    }
    

    encodeSig(sig) {
        return ethersId(sig).substring(0, 10);
    }

    /**
     * parse the impl address
     * @param {*} addrStr 
     * @returns 
     */
    parseAddressFromStorage(addrStr)  {

        let buf = Buffer.from(addrStr.replace(/^0x/, ''), 'hex');
        
        if (!buf.subarray(0, 12).equals(Buffer.alloc(12, 0))) {
            return undefined;
        }
        const address = '0x' + buf.toString('hex', 12, 32); // grab the last 20 bytes

        return getAddress(address);
    }

    /**
     * getBeacon Proxy Implementation address
     * @param {*} contractAddress 
     * @returns 
     */
    async getBeaconProxyImpl(contractAddress) {

        contractAddress = contractAddress.trim()
        
        contractAddress = getAddress(contractAddress)
    
        let contract = ethersContract(contractAddress, proxyBeaconImplAbi, this.provider)

        let addr = ""

        try {
            addr = await contract.implementation().call() 
            //console.log("addr===>", addr)
        } catch (e) {
            console.log("getBeaconProxyImpl:", contractAddress)
        }

        return addr
    }

    /**
     * get a contract's code
     * @param {*} contractAddress 
     * @param {*} proxyCheck 
     * @returns 
     */
    async getCode(contractAddress, proxyCheck = true) {
         
        if(!this.provider){
           throw new Error("Provider required")
        }

         
        let code = await this.provider.getCode(contractAddress);

        if(code == '0x') {
            return code
        }

        let proxySlots = {
           "tranparent": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
            "beacon":    "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50",
            "eip-1822":  "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
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
            
        if (implAddress && isAddress(implAddress) &&
            implAddress != ZeroAddress
        ) {
            code = await this.provider.getCode(implAddress);
        }
        
        return code
    }

    /**
     * check if a contract code contains a method by signature
     * @param {*} signature 
     * @param {*} code 
     * @returns 
     */
    async hasMethod(contractAddr, signature, code) {
        
        const hash = this.encodeSig(signature);

        if(!code || code.trim() == ''){
            code = await this.getCode(contractAddr)
        }

        return code.includes(hash.substring(2));
    }

    /**
     * check if th given contract address or code is the required token standard
     * @param {*} standard 
     * @param {*} contractAddress 
     * @param {*} code 
     * @returns 
     */
    async isTokenStandard(standard, contractAddress, code) {

        let standardMethods = {
            
            "erc721": [
                "ownerOf(uint256)",
                "balanceOf(address)"
            ],

            "erc20": [
                "totalSupply()",
                "balanceOf(address)"
            ],

            "erc1155": [
                "balanceOfBatch(address[],uint256[])",
                "setApprovalForAll(address,bool)"
            ],

        }

        if(!(standard in standardMethods)) return false;

        let methodsArray = standardMethods[standard]

        //console.log("this.web3Http", this.web3Http)
        if(!code || code.length == ""){
            code = await this.getCode(contractAddress)
        }
            
        for (let method of methodsArray) {
            let hasMethod = await this.hasMethod(contractAddress, method, code)
                if (!hasMethod) {
                return false;
            }
        }

        return true;
    }

    /**
     * gasFeeData
     */
    async getFeeData() {
        try {

            if(!this.provider){
                return this.notConnectedError()
            }
            
            let feeData = await this.provider.getFeeData()

            return Status.successPromise(null, feeData)

        } catch(e){
            Utils.logError("Wallet#getFeeData:", e)
            return Status.error("Failed to fetch gas fee data")
        }
    }

    async getETHGasEstimate({ to, value }){
        try {

            if(!this.provider){
                return this.notConnectedError()
            }

            let gasData = await this.provider.estimateGas({
                            to,
                            data: null,
                            value
                        });

            return  Status.successData(gasData)        
        } catch(e){
            Utils.logError("Wallet#getETHGasEstimate:", e)
            return Status.error("Failed to fetch gas estimate")
        }
    }


    async getTxNonce(address, blockTag = 'latest') {
        try {

            let nonce = await this.provider.getTransactionCount(address, blockTag);
            return Status.successData(nonce)

        } catch(e) {
            Utils.logError("Wallet#getTxNonce:", e)
            return Status.error("Failed to fetch gas estimate")
        }
    }


   /**
    * sendEth Tx
    * @param {*} params 
    * @returns 
    */
    async sendETH(params = {}, minConfirmations = 0){
        try {

            //let { to, value, nonce, gasPrice, gasLimit } = params;

            let tx = await this.signer.sendTransaction(params)

              
            let txReceipt = null;

            //if we need to wait for tx to  confirmation to wait
            if(minConfirmations > 0 && typeof tx.wait === 'function') {
                 
                txReceipt = await tx.wait(minConfirmations);
                
                //lets merge 
                tx = {...tx, ...txReceipt};

                 //lets check if status is 1 then its success
                 if(txReceipt.status != 1){
                    return Status.errorPromise("Transaction failed", tx)
                }
            }

            return Status.successData(tx)
        } catch(e){

            Utils.logError(`
                Wallet::sendETH Error: 
                params: ${JSON.stringify(contractParams)}
            `, error)
        
            let requestError = this.__getFailedTxReason(error).trim();

            if(!requestError || requestError.length == 0){
                requestError = "Oops, request failed to complete"
            } else {
                requestError = requestError
            }

            return  Status.errorPromise(requestError)
        }
    }

    
    /**
     * contract
     * @param address 
     * @param abi
     */
    contract(address, abi) {

        try{
            
            let _addr = getAddress(address)
            
            let signer = (this.signer) ?  this.signer : this.provider

            let contract = new ethersContract(_addr, abi, signer)

            let onTxCreatedCallback = null;
            
            contract.onTxCreated = (callback=null) => {
                onTxCreatedCallback = callback
            }

            contract.sendTx = (method, params = [], minConfirmations = 1, ethersOpts={}) => {
                return this.__sendTx({
                    contract,
                    method, 
                    params,
                    minConfirmations,
                    abi,
                    _addr,
                    ethersOpts,
                    onTxCreatedCallback
                });
            }

            return contract;
        } catch (e) {
            Utils.logError(`Failed to initialize contract at ${address} with abi: ${abi}`, e)
            throw e;
        }
    }


    // lets make some methods private
    async __sendTx(argsObj) {

        let contractMethod = "";
        let contractParams = [];

        //console.log( this.web3Provider)

        try{

            let {
                contract,
                method,
                params, 
                minConfirmations,
                abi,
                ethersOpts,
                onTxCreatedCallback
            } = argsObj;

            contractMethod = method;

            if(!params || params == null) params = []

            if(!minConfirmations || minConfirmations == null) minConfirmations = 1

            contractParams = params;

            //let getEvent = (eventNameOrSig) => {return null;}

            let paramsArray = [];

            if(!Array.isArray(params)){
                if(params != null){paramsArray.push(params)}
            } else {
                paramsArray = params;
            }

           // console.log(paramsArray)

            let tx = await contract[method](...paramsArray, ethersOpts);
            
            if (onTxCreatedCallback != null) {
                onTxCreatedCallback(tx)
            }
            
            let txReceipt = null;

            //if we need to wait for tx to  confirmation to wait
            if(minConfirmations > 0 && typeof tx.wait === 'function') {
                 
                txReceipt = await tx.wait(minConfirmations);
                
                //lets merge 
                tx = {...tx, ...txReceipt};

                 //lets check if status is 1 then its success
                 if(txReceipt.status != 1){
                    return Status.errorPromise("Transaction failed", tx)
                }

                if(txReceipt.events && txReceipt.events.length > 0){
                    tx.getEvent = (eventNameOrSig) => {
                        return this.__getEventData(txReceipt.events, eventNameOrSig);
                    }
                }

                // lets get block info 
                let blockInfoStatus = await this.getBlock(tx.blockNumber)

                if(!blockInfoStatus.isError()){
                    let blockInfo = blockInfoStatus.getData()
                    let timestamp = (blockInfo.timestamp * 1000)
                    tx.timestamp = timestamp
                    tx.txDate = new Date(timestamp)
                }
            } //end if

            return Status.successPromise(null, tx);

        } catch (error){
           
             Utils.logError(`
                Wallet::sendTx Error: method: ${contractMethod}, 
                params: ${JSON.stringify(contractParams)}
            `, error)
            
            let requestError = this.__getFailedTxReason(error).trim();

            if(!requestError || requestError.length == 0){
                requestError = "Oops, request failed to complete"
            } else {
                requestError = requestError
            }

            return  Status.errorPromise(requestError)
        }
    }


    __getFailedTxReason(error){

        let errMsg = error.message || "";

        if("reason" in error) {
            errMsg = error.reason;
        }
        else if("data" in error){
            let dataErr = error.data.message || ""
            if(dataErr != ""){
                let dataErrorSplit = dataErr.split(":");
                errMsg = dataErrorSplit[dataErrorSplit.length - 1];
            }
        }

        errMsg = errMsg.replace("Error: VM Exception while processing transaction: reverted with reason string", "")
        
        return errMsg;
    }

    /**
     * __getEventData
     * @param {*} eventsLog
     * @param {*} eventName
     */
    __getEventData(eventsArray, eventNameOrSig) {

        let _selectedEvt = null;
        
       for(let eventObj of eventsArray) {

            let _evtName = eventObj.event || ""
            let _evtSig = eventObj.eventSignature || ""
            let topicsArray = eventObj.topics || []
            
            if(_evtName == eventNameOrSig || 
                _evtSig == eventNameOrSig || 
                topicsArray.includes(eventNameOrSig)    ||
                topicsArray.includes(ethersUtils.id(eventNameOrSig))
            ){
                _selectedEvt = eventObj;
                break;
            }
       }

       return _selectedEvt;
    } //end fun 


    // get block info 
    async getBlock(blockNo) {
        try {

            if(!this.provider){
                return this.notConnectedError()
            }

            let blockInfo = await this.provider.getBlock( blockNo ) 

            //console.log("blockInfo===>", blockInfo)

            return Status.successData(blockInfo)

        } catch(e){
            Utils.logError("Wallet#getBlock:", e)
            return Status.error("Failed to fetch block info")
        }
    }

    
}