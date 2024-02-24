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
    ZeroAddress,
    AbiCoder,
    Network,
    Transaction
} from "ethers"

//import { Buffer } from "buffer/";
import multicall3Config from "../config/multicall3/index.js";
import multicall3Abi from "../data/abi_min/multicall3.js"
import deploylessContractsBytes from "../config/deployless/bytecodes.json"
import botfiContractAddrs from "../config/contracts/botfi/index.js"
import app from "../config/app.js";
import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util"


const defaultAbiCoder = AbiCoder.defaultAbiCoder()


export default class Wallet {

    provider = null
    signer   = null
    chainId  = null
    netInfo  = null  
    contractsInfo = {}

    async connect (netInfo, wallet = null) {

        try {
            
            //let opts = {
            //    staticNetwork: netInfo.chainId
            //}
            this.netInfo = netInfo
            this.chainId = netInfo.chainId;

            let chainIdBN = BigInt(netInfo.chainId.toString())

            let ethersNet = Network.from(chainIdBN)

            let rpc = netInfo.rpcUrls[0]

            this.provider = new ethers.JsonRpcProvider(
                            rpc, 
                            ethersNet, 
                            { staticNetwork: ethersNet }
                        )

            if(wallet != null){
                let setWalletStatus = this.setWallet(wallet)

                if(setWalletStatus.isError()){
                    return setWalletStatus
                }
            }   

            //this.provider.pollingInterval = 5000;

            // lets fetch the block to show that the rpc works 
            let blockNo = await this.provider.getBlockNumber()

            if(!blockNo || typeof blockNo != 'number'){
                Status.error("Failed to connect to network's rpc")
                      .setCode(ErrorCodes.RPC_CONNECT_FAILED)
            }


            return Status.successData(this)

        } catch(e){
            Utils.logError("Wallet#connect:", e)
            return Status.error("Failed to connect to network's rpc")
                         .setCode(ErrorCodes.RPC_CONNECT_FAILED)
        }
    }

    async ping(rpcUrl) {

        let pingErr = Status.error("Failed to connect to RPC node")
                            .setCode(ErrorCodes.FAILED_TO_PING_RPC_NODE)

        try{

            let getBlock = {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1};

            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: {'content-type' : 'application/json'},
                body:    JSON.stringify(getBlock)
            });

            if(!response.ok){
                return pingErr
            }

            let data = await response.json()
            
            let blockNo = parseInt(data.result, 16)
            
            if(!Number.isInteger(blockNo)) return pingErr

            return Status.success()
        } catch(e) {
            return pingErr
        }
    }

    async getSystemContracts() {

        if(this.chainId != null){
            let cachedContracts = this.contractsInfo[this.chainId] || null 

            //console.log("cachedContracts===>", cachedContracts)

            if(cachedContracts != null){
                return cachedContracts
            }
        }

        let processedData = {}

        let contractsObj = botfiContractAddrs[this.chainId]

        for(let contractGroupName of Object.keys(contractsObj)){

            let groupedContracts = contractsObj[contractGroupName]

            for(let contractName of Object.keys(groupedContracts)){
                //console.log("contractName====>", contractName)

                //let abiUrl =

                //lets now fetch the abi 
                let abi = (await import(
                    `../data/abi_min/botfi/${contractGroupName}/${contractName}.js`
                )).default;

                //console.log("abiData===>", abiData)

                let contractAddr = groupedContracts[contractName]

                let pContractInfo = processedData[contractGroupName] || {}

                // merge the data but becareful of not ignoring existing data in same group
                pContractInfo[contractName] = this.contract(contractAddr, abi)

                processedData = {
                    ...processedData,
                    ...{ [contractGroupName]: pContractInfo }
                }
            }
        }

        if(this.chainId != null){
            this.contractsInfo[this.chainId] = processedData
        }

        //console.log("processedData===>", processedData)

        return processedData
    }

    notConnectedError = () => Status.error("Wallet not connected")
                                .setCode(ErrorCodes.WALLET_NOT_CONNECTED)

    setWallet(privateKey) {

        if(!this.provider){
            return this.notConnectedError()
        }

        let __signer = new ethersWallet(privateKey, this.provider)
        
        this.signer = __signer;

        //__signer.signTypedData()
        return Status.successData(this)
    }

    static async createWallet() {
        try {

            let walletInfo = ethersWallet.createRandom()

            return Status.successData(walletInfo)

        } catch(e){
            Utils.logError("Wallet#generateMnemonic:", e)
            return Status.error("Failed to generate seed phrase")
        }
    }

    static createWalletFromSeedPhrase(seedPhrase) {
        try {

            let walletInfo = ethersWallet.fromPhrase(seedPhrase)
            return Status.successData(walletInfo)

        } catch(e) {
            Utils.logError("Wallet#createWalletFromSeedPhrase:", e)
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

    // inputsArr = [{ token, account }]
    async getBalances(inputsArr) {
        try {

            //console.log("inputsArr===>", inputsArr)

            //bool requireSuccess, tuple(address target, bytes callData)[] calls
            let inputData = defaultAbiCoder.encode(
                                [ "tuple(address token,address account)[] calls" ], 
                                [ inputsArr ]
                            )
            
            const bytecode = deploylessContractsBytes.Balances
                                .concat(inputData.slice(2))    
        
            const encodedReturnData =   await this.provider.call({ 
                                            data: bytecode
                                        });

            //console.log("encodedReturnData===>", encodedReturnData)

            let decodedData = defaultAbiCoder.decode(
                                    ["uint256[]"],
                                    encodedReturnData
                                )
            
            let resultData = decodedData[0].toArray()

            return Status.successData(resultData)
        } catch(e){
            Utils.logError("Wallet#deploylessMulticall:", e)
            return Status.error("multicall failed")
        }
    }

    __prepareMuticallInputs(inputsArr) {

        let inputs = []
        
        for(let i in inputsArr){
                
            let { abi, target, method, args, label } = inputsArr[i]

            let iface = new Interface(abi);
            let callData = iface.encodeFunctionData(method, args)

            inputs[i] = ({  target, callData })
        } 

        return inputs;
    }

    async ___deploylessMulticall(inputsArr, revertOnError = false) { 
        try {

            let inputs = this.__prepareMuticallInputs(inputsArr)

            //bool requireSuccess, tuple(address target, bytes callData)[] calls
            let inputData = defaultAbiCoder.encode(
                                [ "bool requireSuccess",
                                  "tuple(address target, bytes callData)[] calls" 
                                ], 
                                [ revertOnError, inputs ]
                            )
           // console.log("inputData===>", inputData)
            const bytecode = deploylessContractsBytes.DeploylessMulticall
                                .concat(inputData.slice(2))    
            
            const encodedReturnData =   await this.provider.call({ 
                                            data: bytecode
                                        });

            let decodedData = defaultAbiCoder.decode(
                                ["tuple(bool,bytes)[]"],
                                encodedReturnData
                            )

            let resultArr = decodedData.toArray().flat()
            
            return this.___processMulticallResults(inputsArr, resultArr)

        } catch(e){
            Utils.logError("Wallet#deploylessMulticall:", e)
            return Status.error("multicall failed")
        }
    }

    async multicall(inputsArr, revertOnError=false) {
        return this. multicall3(inputsArr, revertOnError);
    }

    /**
     * This returns an object where the labels are the keys, suited simple queries
     * @param {*} inputsArr 
     * @param {*} revertOnError 
     * @returns 
     */
    async multicallToObj(inputsArr, revertOnError=false) {
        
        let resultStatus = await this.multicall3(inputsArr, revertOnError);

        if(resultStatus.isError()) return resultStatus

        let dataArr = resultStatus.getData()

        let resultObj = {}

        dataArr.forEach( item => resultObj[item.label] = item.data)

        return Status.successData(resultObj)
    }

    async multicall3(inputsArr, revertOnError=true) {

        if(!this.provider){
            return Status.error("Connect Wallet")
        }

        if(!multicall3Config.supported_chains.includes(this.chainId)){
            return this.___deploylessMulticall(inputsArr, revertOnError)
        }

        let inputs = this.__prepareMuticallInputs(inputsArr) 

        let sysMcallAddrs = multicall3Config.system_multicall_addrs

        let mCallContractAddr = (this.chainId in sysMcallAddrs) 
                            ? sysMcallAddrs[this.chainId]
                            : multicall3Config.contract

        let mCallContract = this.contract(mCallContractAddr, multicall3Abi)

        //console.log("mCallContract===>", mCallContract)
     
        let resultsArr =  await mCallContract.tryAggregate.staticCall(revertOnError, inputs)
     
        return this.___processMulticallResults(inputsArr, resultsArr)
    }


    ___processMulticallResults(inputsArr, resultsArr) {
                                    
        let processedResult = []

        //console.log("resultsArr===>", resultsArr)

        for(let i in resultsArr) {
                
            //console.log("resultsArr[i]===>", inputsArr[i])

            let [success, result] = resultsArr[i].toArray()
            let { abi, method, label } = inputsArr[i]
            
            let iface = new Interface(abi);
            let decodedResult = null

            //console.log("label ===>", label)
            //console.log("success ===>", success)

            if(!result || result  == '0x') {
                processedResult[i] = {
                    label,
                    data: decodedResult
                }
                
                continue;
            }


            try {

                if(success){
                    decodedResult = iface.decodeFunctionResult(
                                        iface.getFunction(method), 
                                        result
                                    )
                    
                    //console.log("decodedResult===>", decodedResult)
                    // if multiple results were not returned 
                    // then send the 1 result, else just maintain the 
                    // multiple result
                    if(decodedResult.length == 1){
                        decodedResult = decodedResult[0]
                    }

                } else {
                    let decodedError = iface.parseError(result)
                    Utils.logError(`Wallets#multicall3: ${label} : ${decodedError}`)
                }

                //console.log("label===>", label)

                processedResult[i] = {
                    label,
                    data: decodedResult
                }

            } catch(e){
                Utils.logError("Wallet#mcall3:", e)
                processedResult[i] = {
                    label,
                    data: null
                }
            }
        } //end loop

        //console.log("processedResult===>", processedResult)

        return Status.successData(processedResult)
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
            
            let fd = await this.provider.getFeeData()

            fd = { ...fd }

            ///console.log("fd===>", fd)

            fd.supportsEip1559Tx = (!(fd.maxFeePerGas == null && fd.maxPriorityFeePerGas == null))
 
            if(fd.maxFeePerGas == null){
                fd.maxFeePerGas = fd.gasPrice
            }

            return Status.successData(fd)

        } catch(e){
            Utils.logError("Wallet#getFeeData:", e)
            return Status.error("Failed to fetch gas fee data")
        }
    }

    async getETHGasEstimate({ to, value, data = null }){
        try {

            if(!this.provider){
                return this.notConnectedError()
            }

            let gasData = await this.provider.estimateGas({
                            to,
                            data,
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
    async sendETH(params = {}, minConfirmations = 1){
        try {

            //let { to, value, nonce, gasPrice, gasLimit } = params;

            let tx = await this.signer.sendTransaction(params)

              
            let txReceipt = null;

            //if we need to wait for tx to  confirmation to wait
            if(minConfirmations > 0 && typeof tx.wait === 'function') {
                 
                txReceipt = await tx.wait(minConfirmations);

                //console.log("txReceipt===>", txReceipt)
                //console.log("tx===>", tx)

                //lets merge 
                tx = {...tx, ...txReceipt};

                 //lets check if status is 1 then its success
                 if(txReceipt.status != 1){
                    return Status.errorPromise("Transaction failed", tx)
                }
                
                // lets get block info 
                let blockInfoStatus = await this.getBlock(tx.blockNumber)

                if(!blockInfoStatus.isError()){
                    let blockInfo = blockInfoStatus.getData()
                    tx.timestamp = blockInfo.timestamp
                }
            }

            return Status.successData(tx)
        } catch(error){

            Utils.logError(`
                Wallet::sendETH Error: 
                params: ${JSON.stringify(params)}
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

            //.log("contract===>", contract)

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
                    tx.timestamp = blockInfo.timestamp
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
                topicsArray.includes(ethers.id(eventNameOrSig))
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
    
    async currentBlockInfo () {
        let latestBlockNo = await this.provider.getBlockNumber()
        return this.getBlock(latestBlockNo)
    }

    /**
     * fetch last 5 blocks data
     */
    async getPastTxByBlocks(blockSince = 5, delay=3){
        try {

            if(!this.provider){
                return this.notConnectedError()
            }
            
            //let latest blockNumber 
            let latestBlockNo = await this.provider.getBlockNumber()

            let blockStart = latestBlockNo - blockSince

            let txDataArr = []

            for(let i = blockStart; i <= latestBlockNo; i++) {
                try{
                    let blockInfo = await this.provider.getBlock(i, true)

                    let txArr = blockInfo.prefetchedTransactions.map(tx => {
                                    tx.timestamp = blockInfo.timestamp
                                    return tx
                                })

                    txDataArr.push(...txArr)

                } catch(e){}

                await Utils.sleep(delay)
            }

            return Status.successData(txDataArr)
        } catch(e){
            Utils.logError("Wallet#getBlock:", e)
            return Status.error("Failed to fetch block info")
        }
    }
    
    async getAddress(){
       return this.signer.getAddress()
    }

    async rpcSendTx(method, params) {
        try{

            if(params.length == 0){
                let err = new Error("Invalid parameters")
                err.code = ErrorCodes.invalidParams
                throw err
            }

            let txDataObj = params[0]

            if(method == "eth_sendRawTransaction"){
                txDataObj = Transaction.from(params[0])
            }

  
            let tx = await this.signer.sendTransaction(txDataObj)
            
            return tx.hash;

        } catch(e){
            throw e;
        }
    }

    async eth_signTypedData_v4(params) {
        try {

            const [address, data] = params;

            let version = SignTypedDataVersion.V4

            let privateKey = Buffer.from(
                this.signer.privateKey.substring(2),
                'hex',
            );

            return signTypedData({
                privateKey, 
                data, 
                version
            })

        } catch(e){
            console.log("Wallet#eth_signTypedData_v4: ", e)
            throw e;
        }
    }

    async queryRPCMethod(method, params=[]) {

        let query = null;

        switch(method){

            case "eth_chainId":
                query = async () => Utils.toHex(this.chainId)
            break;
            case "eth_requestAccounts":
                query = async () => [await this.getAddress()]
            break;
            case "eth_accounts":
                query = async () => [await this.getAddress()]
            break;
            case "eth_sendTransaction":
                query = () => this.rpcSendTx("eth_sendTransaction", params)
            break;
            case "eth_signTypedData_v4":
                query = () => this.eth_signTypedData_v4(params)
            break;
            default:
                query = () => this.provider.send(method, params)
            break;
        }

        try {

            let result = await query()

            return Status.successData(result)

        } catch(e){
            return Status.error(e.message)
                         .setCode(e.code)
        }
       
    }

}