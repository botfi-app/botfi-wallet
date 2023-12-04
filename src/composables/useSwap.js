/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import {ref,  computed, onBeforeMount, toRaw } from 'vue'
import Status from '../classes/Status';
import Utils from '../classes/Utils';
import { useNetworks } from "./useNetworks"
import swapConfig from "../config/swap"
import { Interface, decodeBytes32String, formatUnits, solidityPacked } from 'ethers';
import swapFunctionMap from "../config/swap/swap_function_map"
import { useSimpleDB  } from './useSimpleDB';
import botfiContracts from '../config/contracts/botfi'; 

const supportedChains = swapConfig.supported_chains;

const defaultSettings = { slippage: swapConfig.default_slippage}

const $state = ref({
    isSupported: false,
    routes: {},
    contractsInfo: {},
    swapSetting:  defaultSettings,
    swapContracAddrs: null
})

export const useSwap =  () => {

    const networks = useNetworks()
    const netInfo = ref()

    const isSupported = computed(()=> $state.value.isSupported )
    const routes = computed(() => $state.value.routes)
    const contractsInfo = computed(() => $state.value.contractsInfo)
    const simpleDB = useSimpleDB()

    onBeforeMount(() => {
        getSwapSetting()
        initialize()
    })

    const initialize = async () => {
        await isChainSupported()
    }

    const getSwapSetting = async () => {
        let net = await networks.getActiveNetworkInfo()
        let _settings = await simpleDB.getItem(`swap_setting_${net.chainId}`) || {}
        $state.value.swapSetting = { ...$state.value.swapSetting, ..._settings }
        return $state.value.swapSetting
    }

    const saveSwapSetting = async (dataObj={}) => {
        let data = { ...$state.value.swapSetting, ...dataObj }
        let net = await networks.getActiveNetworkInfo()
        await simpleDB.setItem(`swap_setting_${net.chainId}`, data)

        $state.value.swapSetting = data;
        return true 
    }

    const swapSetting = computed(()=> $state.value.swapSetting )

    const isChainSupported = async () => {
        
        let net = await networks.getActiveNetworkInfo()

        $state.value.isSupported = ( net.chainId in supportedChains && 
                                     supportedChains[net.chainId] == true 
                                    )
        return $state.value.isSupported
    }
    
    const getContractsAddrs = async (chainId) => {
        return botfiContracts[chainId]
    }

    const getWeb3 = async () => {
          
        let web3Status = await networks.getWeb3Conn()

        if(web3Status.isError()){
            Utils.logError("useSwap#getWeb3", web3Status.getMessage())
            return null
        }

        return web3Status.getData()
    }

    // fetch the routes 
    const getRoutes = async (web3 = null) => {

        let net = await networks.getActiveNetworkInfo()
        
        let curRoutes = routes.value[net.chainId] || null

        if(curRoutes != null) {
            return Status.successData(curRoutes)
        }

        if(web3 == null) web3 = await getWeb3()

        web3 = toRaw(web3)

        let contractsInfo =  await web3.getSystemContracts()

        //console.log("contractsInfo===>", contractsInfo)
        
        let swapContract = contractsInfo.swap.factory;

        ///console.log("swapFactory==>", swapContract)
  
        let resultsData = await swapContract.getAllRoutes() 

        //console.log("resultsData===>", resultsData)

        let processedData = []

        for(let routeItem of resultsData){
            
            routeItem = { ...routeItem.toObject() }

            let parsedId = decodeBytes32String(routeItem.id)
            let parsedGroup = decodeBytes32String(routeItem.group)

            routeItem["parsedId"] = parsedId
            routeItem["parsedGroup"] = parsedGroup

            //console.log("routeItem==>", routeItem)

            processedData.push(routeItem)
        }
        
        return Status.successData(processedData)
    }

    const getSwapFunctionName = async(routeGroup, functionName) => {
        let funcsObj = swapFunctionMap[routeGroup] || {}
        return (funcsObj[functionName] || functionName)
    }


    const getPath = (route, tokenAInfo, tokenBInfo) => {
        
        let path;

        if(Utils.isNativeToken(tokenAInfo.contract)) {
            path = [ route.weth, tokenBInfo.contract ]
        } else if(Utils.isNativeToken(tokenBInfo.contract)){
            path = [ tokenAInfo.contract, route.weth ]
        } else {
            path = [ tokenAInfo.contract, route.weth, tokenBInfo.contract ]
        }

        if(route.parsedGroup != 'uni_v3'){
            return path; 
        }

        let pathBytes;
        let univ3Fee = 3000; // 0.3%, uniswap uses a millionth 1e6 1_000_000 divisor instead of 
        //10_000 1e4, this helps handling tiny values

        ///console.log("path====>", path)

        if(path.length == 2){
            pathBytes = solidityPacked(
                            ["address", "uint24", "address"], 
                            [path[0], univ3Fee, path[1]]
                        )
        } else {
            pathBytes = solidityPacked(
                            ["address", "uint24", "address", "uint24", "address"], 
                            [path[0], univ3Fee, path[1], univ3Fee, path[2]]
                        )
        }
        
        return pathBytes
    }


    const fetchQuotes = async({
        web3,
        amountInBigInt,
        tokenAInfo,
        tokenBInfo,
        slippage,
        recipient
    }) => {
        try {

            //console.log("tokenBInfo===>", tokenBInfo)
            let routesStatus = await getRoutes(web3)
            
            if(routesStatus.isError()){
               return Status.error(`Failed to fetch swap routes: ${routesStatus.getMessage()}`)
            }

            let swapRoutes = routesStatus.getData() || []

            let protocolFee = Utils.percentToBPS(swapConfig.protocol_fee_percent);

            let protocolFeeAmt = Utils.calPercentBPS(amountInBigInt, protocolFee)

            //console.log("protocolFeeAmt===>", protocolFeeAmt)
    
            let amountInWithFee = amountInBigInt - protocolFeeAmt;

            //console.log("swapRoutes===>", swapRoutes)

            let slippageBPS = Utils.percentToBPS(slippage)

            let routesABIs = swapConfig.routes_ABIs;
    
            let quoteFunc = "get_amounts_out"

            // lets get feeData
            let feeDataStatus = await web3.getFeeData()
            let feeData = feeDataStatus.getData()
    
            let mcallInputs = []
            

            for(let routeIndex in swapRoutes){
                
                let route = swapRoutes[routeIndex]

                let routeGroup = route.parsedGroup
                let routeId = route.parsedId;
                let abi;
                let target;

                //if(routeGroup !== 'uni_v3') continue
    
                let isUniV2 = routeGroup == "uni_v2"
    
                if(isUniV2) {
                    abi = routesABIs[`${routeGroup}_router`]
                    target = route.router;
                } else {
                    abi = routesABIs[`${routeGroup}_quoter`]
                    target = route.quoter;
                }
    
                let path = getPath(route, tokenAInfo, tokenBInfo)
    
                let args = [];
    
                if(["uni_v2"].includes(routeGroup)){
                    args = [amountInWithFee, path]
                }
                else if(["tjoe_v20", "tjoe_v21"].includes(routeGroup)){
                    args = [path, amountInWithFee]
                } 
                else if (routeGroup == 'uni_v3'){
                    args = [path, amountInWithFee]
                }
                else {
                    continue;
                }
    
                let method =  await getSwapFunctionName(routeGroup, quoteFunc)
    
                let label = `${routeIndex}|${routeId}`
    
                mcallInputs.push({ label, target, method, args, abi })
            } //end for loop 
            
            ///console.log("mcallInputs===>", mcallInputs)
     
            let resultStatus =  await web3.multicall3(
                                    mcallInputs, 
                                   false
                                )
    
            if(resultStatus.isError()){
                return resultStatus
            }
    
            let resultData = resultStatus.getData() || []

            //console.log("resultData===>", resultData)
        
            let processedQuotes = []
            let gasEstimateCallsArr = []
    
            for(let item of resultData) {
    
                let { label, data } = item; 

                //console.log("label===>", label)
                //console.log("data===>", data)
                
    
                if(data == null) continue;
    
                let [ routeIndex, routeId ] = label.split("|")
 
                let routeInfo = swapRoutes[routeIndex]

                let routeGroup = routeInfo.parsedGroup
    
                let dataObj = {}
                let amountOut;
                //let estimatedGas;
    
                if(["tjoe_v20", "tjoe_v21"].includes(routeGroup)){
                    
                    dataObj = data.toObject()
    
                    //console.log("dataObj====>", dataObj)
                    amountOut = Utils.lastArrayItem(dataObj.virtualAmountsWithoutSlippage) // get last item in the array
    
                    if(amountOut == null) continue; 
                } 
                else if(routeGroup == 'uni_v2') {
                    
                    let dataArr = data.toArray()

                    if(dataArr.length > 0){
                        amountOut    = dataArr[dataArr.length - 1]
                    }
                }
                else if(routeGroup == 'uni_v3') {

                    let dataArr = data.toArray()

                    //console.log("dataArr===>", dataArr)

                    if(dataArr.length > 0){
                        amountOut    = dataArr[dataArr.length - 1]
                    }
                } 
                
                //console.log("amountOut===>", amountOut)

                // if no value, skip
                if(!amountOut) continue;
            
                dataObj['routeInfo'] = routeInfo

                let slippageAmt = Utils.calPercentBPS(amountOut, slippageBPS)
               
                let amountOutWithSlippage = (amountOut - slippageAmt)

                dataObj.amountOutWithSlippage = amountOutWithSlippage
                dataObj.amountOut = amountOut
                dataObj.formattedAmountOut = formatUnits(amountOut, tokenBInfo.decimals)
                dataObj.formattedAmountOutWithSlippage = formatUnits(
                                                            amountOutWithSlippage, 
                                                            tokenBInfo.decimals
                                                        )
                
                dataObj.feeData = feeData


                dataObj.amountInWithoutFee = amountInBigInt
                dataObj.amountInWithFee    = amountInWithFee
                dataObj.amountOutMin       = amountOutWithSlippage

                dataObj.recipient  = recipient
                
                // get gas estimate 
                dataObj.estimateGas = async () => {
                    
                    let resultStatus = await estimateGas({ 
                        web3, 
                        quoteInfo: dataObj,
                        tokenAInfo,
                        tokenBInfo
                    })

                    let data = resultStatus.getData() || null

                    if(resultStatus.isError() || data == null) return null;

                    ///console.log("data===>", data)

                    return { 
                        gasLimit:         data.gasLimit,
                        gasFee:           data.gasLimit * feeData["gasPrice"],
                        payload:          data.payload,
                        nativeTokenValue: data.nativeTokenValue,
                        payloadAbi:       data.payloadAbi
                    }
                } //end gas estimate

                gasEstimateCallsArr.push(dataObj.estimateGas())
                processedQuotes.push(dataObj)

            } //end loop
            
            let estimateGasResults =  await Promise.allSettled(gasEstimateCallsArr)

            for(let i in estimateGasResults){

                let pResult = estimateGasResults[i]

                if(pResult.status != 'fulfilled'){
                    Utils.logError(`useSwap#fetchQuote#estimateGasResults: ${pResult.reason}`)
                    continue
                }
              
                if(pResult.value  != null){
                    processedQuotes[i] = {...processedQuotes[i], ...pResult.value}
                }
            }

            // sort with higher output and lower gas
            let sortedData = processedQuotes.sort(( item1, item2 ) => {
                if(item1.amountOut > item2.amountOut) return -1;
                else return 0
            }).sort(( item1, item2 ) => {

                let item1GasFee = item1.gasFee || null
                let item2GasFee = item2.gasFee || null

                if(item1GasFee  != null && 
                    item2GasFee != null && 
                    (item1.amountOut > item2.amountOut || item1.amountOut == item2.amountOut) &&
                    item1GasFee <= item2GasFee
                ) 
                return -1;
                else return 0;

            })

            return Status.successData(sortedData)
        } catch(e){
            Utils.logError("useSwap#fetchQuote:",e)
            return Status.error("Failed to fetch quotes, try again")
        } 
    }

    /**
     * prepareSwap
     */
    const getSwapPayload = async ({ 
        quoteInfo,
        tokenAInfo,
        tokenBInfo
    }) => {
        try { 
            
            //console.log("quoteInfo===>", quoteInfo)

            let routeInfo       = quoteInfo.routeInfo
            let amountOutMin    = quoteInfo.amountOutMin
            let amountInWithFee = quoteInfo.amountInWithFee

            /// amount with no fee, used for tx native token value incase its eth
            let amountInWithoutFee = quoteInfo.amountInWithoutFee
            
            let recipient = quoteInfo.recipient

            let routeGroup = routeInfo.parsedGroup;
            
            let tokenAAddr = tokenAInfo.contract
            let tokenBAddr = tokenBInfo.contract

            let funcDataArr = [];

            let deadline = parseInt(Math.ceil((Date.now() / 1000) + (60 * 60))); // 60mins

            let path = getPath(routeInfo, tokenAInfo, tokenBInfo)

            //console.log("routeGroup====>",routeGroup)
        
            if(["tjoe_v20", "tjoe_v21", "uni_v2"].includes(routeGroup)){

                /*v2.1 
                struct Path {
                    uint256[] pairBinSteps;
                    Version[] versions;
                    IERC20[] tokenPath;
                }*/

                if(routeGroup == "tjoe_v20"){
                    path =  quoteInfo.route.toArray()
                }
                else if(routeGroup == "tjoe_v21"){
                    path = {
                        pairBinSteps: quoteInfo.binSteps.toArray(),
                        versions:     quoteInfo.versions.toArray(),
                        tokenPath:    quoteInfo.route.toArray()
                    }
                }

                // if token A is weth or native
                if(Utils.isNativeToken(tokenAAddr)) {

                    tokenAAddr = routeInfo.weth;

                    let funcName1 = await getSwapFunctionName(
                                    routeGroup, 
                                    "swap_exact_native_for_tokens"
                                )
                    let funcName2 = await getSwapFunctionName(
                        routeGroup, 
                        "swap_exact_native_for_tokens_with_transfer_tax"
                    )

                    let args = [
                        amountOutMin
                    ]

                    if(routeGroup == "tjoe_v20"){
                        args.push(quoteInfo.binSteps.toArray())
                    }

                    args = [...args, ...[
                        path,
                        recipient,
                        deadline
                    ]]

                    // value we will pass to ethers as Native asset
                    let nativeValue = amountInWithoutFee

                    funcDataArr = [
                        { name: funcName1, 
                          args, 
                          nativeValue
                        },
                        { name: funcName2,
                           args, 
                           nativeValue  
                        }
                    ]

                } 
                    // if token B is native
                else if(Utils.isNativeToken(tokenBAddr)) { 

                    tokenBAddr = routeInfo.weth;

                    let funcName1 = await getSwapFunctionName(
                                    routeGroup, 
                                    "swap_exact_tokens_for_native"
                                )

                    let funcName2 = await getSwapFunctionName(
                        routeGroup, 
                        "swap_exact_tokens_for_native_with_transfer_tax"
                    )

                    let args = [
                        amountInWithFee,
                        amountOutMin
                    ]

                    if(routeGroup == "tjoe_v20"){
                        args.push(quoteInfo.binSteps.toArray())
                    }

                    args = [...args, ...[
                        path,
                        recipient,
                        deadline
                    ]]

                    let nativeValue = 0;

                    funcDataArr = [
                        { name: funcName1, 
                          args, 
                          nativeValue
                        },
                        { name: funcName2,
                           args,
                           nativeValue
                        }
                    ]

                }
                // transfer token for tokens 
                else {

                    let funcName1 = await getSwapFunctionName(
                        routeGroup, 
                        "swap_exact_tokens_for_tokens"
                    )

                    let funcName2 = await getSwapFunctionName(
                        routeGroup, 
                        "swap_exact_tokens_for_tokens_with_transfer_tax"
                    )

                    let args = [
                        amountInWithFee,
                        amountOutMin
                    ]

                    if(routeGroup == "tjoe_v20"){
                        args.push(quoteInfo.binSteps.toArray())
                    }

                    args = [...args, ...[
                        path,
                        recipient,
                        deadline
                    ]]

                    let nativeValue = 0;

                    funcDataArr = [
                        { name: funcName1, 
                          args, 
                          nativeValue
                        },
                        { name: funcName2,
                          args,
                          nativeValue
                        }
                    ]

                } //end token to token swap 
            } //end if uni v2 or trader joe v2 or 2.1
            

            else if(routeGroup == 'uni_v3') {

                let funcName = await getSwapFunctionName(
                    routeGroup, 
                    "exact_input"
                )

                let params = {
                    path, 
                    recipient,
                    deadline,
                    amountIn: amountInWithFee,
                    amountOutMinimum: amountOutMin
                }

                let nativeValue = 0;

                if(Utils.isNativeToken(tokenAAddr)){
                    // value we will pass to ethers as Native asset
                    // since the fee will be taken on the contract level'
                    // send the full amount
                    nativeValue = amountInWithoutFee
                }

                //console.log("params===>", params)
                //console.log("nativeValue===>", nativeValue)

                funcDataArr = [
                    { name: funcName, 
                      args: [params], 
                      nativeValue
                    }
                ]
            } else {
                return null 
            }

            // lets get abi 
            let abi = swapConfig.routes_ABIs[`${routeGroup}_router`]

            //console.log("abi====>", abi)

            let iface = new Interface(abi)

            let callDataArr = []
            
            for(let funcItem of funcDataArr){
                //console.log("funcItem===>", funcItem)
                let callData = iface.encodeFunctionData(
                                    iface.getFunction(funcItem.name), 
                                    funcItem.args
                                )
                callDataArr.push({
                    payload:  callData,
                    funcData: funcItem,
                    iface
                })
            }

           //iface.parseError()

            return { callDataArr, iface }
        } catch(e){
            Utils.logError("useSwap#prepareSwap:",e)
            return Status.error("Failed to prepare swap, try again")
        } 
    }

    // excute a swap 
    const executeSwap = async ({ 
        web3, 
        quoteInfo,
        tokenAInfo,
        tokenBInfo,
        gasInfo,
        nonce
    }) => {

        let iface;
        let swapFactory;
        let errMsg = ""

        try {

            //console.log("tokenAInfo===>", tokenAInfo)

            let routeInfo = quoteInfo.routeInfo;

            let amountInWithoutFee = quoteInfo.amountInWithoutFee 

            let routeIdBytes32 = routeInfo.id;

            let feeData = quoteInfo.feeData

            // lets get swap contract
            let contracts = await web3.getSystemContracts()

            swapFactory = contracts.swap.factory;

            //console.log("quoteInfo===>", quoteInfo)
            //console.log("amountInWithoutFee===>", amountInWithoutFee)
            
            let payload = quoteInfo.payload;
            let nativeTokenValue = quoteInfo.nativeTokenValue
            iface = quoteInfo.payloadAbi

            let ethersOptsObj = {
                value: nativeTokenValue
            }

            if(feeData.supportsEip1559Tx){
                ethersOptsObj.maxFeePerGas = gasInfo.maxFeePerGas
                ethersOptsObj.maxPriorityFeePerGas = gasInfo.maxPriorityFeePerGas
            } else {
                ethersOptsObj.gasPrice = gasInfo.maxFeePerGas
            }

            let tx = await swapFactory.swap(
                                routeIdBytes32,
                                amountInWithoutFee,
                                tokenAInfo.contract,
                                payload,
                                ethersOptsObj
                            )

            
            let receipt = await tx.wait(1);

            tx = {...tx, ...receipt}
            
            //console.log("tx====>", tx)

            return Status.successData(tx)

        }catch(e){

            errMsg =  e.shortMessage || ""
                    
            Utils.logError("useSwap#excuteSwap", e)

            if(!(e.data  == null || e.data == "0x") && !errMsg.toLowerCase().includes("botfi")){
                try{ errMsg = iface.parseError(errData).toString() } catch(e){}
            }

            if(errMsg == ""){
                errMsg = "Swap failed, try again later"
            }

            errMsg = errMsg.replace(/([\"\\]+)/g, "")
            
            return Status.error(errMsg)
        }
    }

    // lets get gas etimate for a swap 
    const estimateGas = async ({
         web3, 
         quoteInfo,
         tokenAInfo,
         tokenBInfo 
    }) => {
        try {

            let routeInfo = quoteInfo.routeInfo;
            let amountInWithoutFee = quoteInfo.amountInWithoutFee

            let routeIdBytes32 = routeInfo.id;

            // lets get swap contract
            let contracts = await web3.getSystemContracts()

            let swapFactory = contracts.swap.factory;

            let dataObj = await getSwapPayload({
                                    tokenAInfo,
                                    tokenBInfo,  
                                    quoteInfo
                                })
            
            let { callDataArr, iface } = dataObj;

            let errMsg;

            //let wallet = web3.signer.address 

           for(let index in callDataArr) {

                let { payload, funcData } = callDataArr[index]

                try {

                    let gasLimit = await swapFactory.swap.estimateGas(
                                    routeIdBytes32,
                                    amountInWithoutFee,
                                    tokenAInfo.contract,
                                    payload,
                                    { value: funcData.nativeValue }
                                )
                    
                    return Status.successData({ 
                        gasLimit, 
                        payload,
                        nativeTokenValue: funcData.nativeValue,
                        payloadAbi: iface 
                    })
                } catch(e){
                    
                    Utils.logError("useSwap#getSwapGasEstimate", e)

                    errMsg = e.toString()

                    if(index == callDataArr.length - 1){
                        
                        let errData = e.data || null

                        if(errData != null && !['0x','0x0'].includes(errData.toLowerCase())){
                            errMsg = iface.parseError(errData)
                        }

                    }
                }
            } //end loop

            return Status.error(errMsg)

        } catch(e){
            Utils.logError("useSwap#prepareSwap:",e)
            return Status.error(e.message)
        } 
    }

    return {
        swapSetting,
        saveSwapSetting,
        isSupported,
        isChainSupported,
        routes,
        getRoutes,
        getSwapFunctionName,
        fetchQuotes,
        getPath,
        executeSwap,
        getContractsAddrs
    }
}
    