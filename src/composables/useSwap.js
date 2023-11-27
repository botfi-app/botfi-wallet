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

const supportedChains = swapConfig.supported_chains;

const defaultSettings = { slippage: swapConfig.default_slippage}

const $state = ref({
    isSupported: false,
    routes: {},
    contractsInfo: {},
    swapSetting:  defaultSettings
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
        swapRoutes,
        amountInBigInt,
        tokenAInfo,
        tokenBInfo,
        slippage,
        recipient
    }) => {
        try {

            let protocolFee = Utils.percentToBPS(swapConfig.protocol_fee_percent);

            let protocolFeeAmt = Utils.calPercentBPS(amountInBigInt, protocolFee)
    
            let amountInWithFee = amountInBigInt - protocolFeeAmt;

            //console.log("amountInWithFee===>", amountInWithFee)

            let slippageBPS = Utils.percentToBPS(slippage)

            let routesABIs = swapConfig.routes_ABIs;
    
            let quoteFunc = "get_amounts_out"
    
            let mcallInputs = []
            
            let gasEstimateCalls = []
            
            for(let routeIndex in swapRoutes){
                
                let route = swapRoutes[routeIndex]

                let routeGroup = route.parsedGroup
                let routeId = route.parsedId;
                let abi;
                let target;
    
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
            
     
            let resultStatus =  await web3.multicall3(
                                    mcallInputs, 
                                   false
                                )
    
            if(resultStatus.isError()){
                return resultStatus
            }
    
            let resultData = resultStatus.getData() || []

           // console.log("routeGroup====>", route.routeGroup)
            //console.log("resultData===>", resultData)
        
            let processedQuotes = []
    
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
                else if(routeGroup == 'uni_v3') {

                    let dataArr = data.toArray()
                    amountOut    = dataArr[0]
                } 
                else {
                    continue;
                }

            
                dataObj['routeId'] = routeId
                dataObj['routeGroup'] = routeGroup

                let slippageAmt = Utils.calPercentBPS(amountOut, slippageBPS)
                let amountOutWithSlippage = (amountOut - slippageAmt)

                dataObj.amountOutWithSlippage = amountOutWithSlippage
                dataObj.amountOut = amountOut
                dataObj.formattedAmountOut = formatUnits(amountOut, tokenBInfo.decimals)
                dataObj.formattedAmountOutWithSlippage = formatUnits(
                                                            amountOutWithSlippage, 
                                                            tokenBInfo.decimals
                                                        )
            
                // lets fetch the gas info 
                gasEstimateCalls.push(
                    getSwapGasEstimate({
                        web3,
                        tokenAInfo,
                        tokenBInfo,
                        routeInfo,
                        recipient,
                        amountInWithFee,
                        quoteInfo: dataObj,
                        amountInWithoutFee: amountInBigInt,
                        amountOutMin: amountOutWithSlippage
                    })
                )
    
                processedQuotes.push(dataObj)
            }

            let gasEstimatesResultArr = await Promise.all(gasEstimateCalls)

            // lets get feeData
            let feeDataStatus = await web3.getFeeData()
            let feeData = feeDataStatus.getData()

            //console.log("feeData===>", feeData)

            if(!(feeDataStatus.isError() &&   feeData == null)) {
                for(let index in gasEstimatesResultArr){
                    
                    let gasEstimateStatus = gasEstimatesResultArr[index]
                    let gasLimit = gasEstimateStatus.getData() 
                    let totalGasFee;

                    if(gasLimit != null){
                        totalGasFee = gasLimit * feeData["maxFeePerGas"]
                    }

                    processedQuotes[index].gasFee = totalGasFee
                    processedQuotes[index].gasLimit = gasLimit
                    processedQuotes[index].feeData = feeData
                }
            }

            // sort with higher output and lower gas
            let sortedData = processedQuotes.sort(( item1, item2 ) => {
                if(item1.amountOut > item2.amountOut) return -1;
                else return 0
            }).sort(( item1, item2 ) => {
                if(item1.amountOut == item2.amountOut &&
                    item1.gasEstimate != null && item2.gasEstimate != null &&
                    item1.gasEstimate <= item2.gasEstimate  
                ) return -1
                else return 0;
            })

            //console.log("sortedData===>", sortedData)

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
        routeInfo,
        amountOutMin, 
        tokenAInfo,
        tokenBInfo, 
        amountInWithFee,
        amountInWithoutFee,
        quoteInfo,
        recipient
    }) => {
        try {   

            let routeId = routeInfo.parsedId
            let routeGroup = routeInfo.parsedGroup;
            let tokenAAddr = tokenAInfo.contract;
            let tokenBAddr = tokenBInfo.contract;

            let funcDataArr = [];

            let deadline = parseInt(Math.ceil((Date.now() / 1000) + (60 * 30))); // 30mins

            let path = getPath(routeInfo, tokenAInfo, tokenBInfo)
        
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
                console.log("funcItem===>", funcItem)
                let callData = iface.encodeFunctionData(
                                    iface.getFunction(funcItem.name), 
                                    funcItem.args
                                )
                callDataArr.push(callData)
            }

           //iface.parseError()

            return { callDataArr, funcDataArr, iface }
        } catch(e){
            Utils.logError("useSwap#prepareSwap:",e)
            return Status.error("Failed to prepare swap, try again")
        } 
    }


    // lets get gas etimate for a swap 
    const getSwapGasEstimate = async ({
        web3,
        routeInfo,
        amountOutMin, 
        tokenAInfo,
        tokenBInfo, 
        amountInWithFee,
        amountInWithoutFee,
        quoteInfo,
        recipient
    }) => {
        try {

            let routeGroup = routeInfo.parsedGroup

            //if(routeGroup != 'uni_v3') return;

            let routeIdBytes32 = routeInfo.id;

            let swapDataObj = await getSwapPayload({
                                routeInfo,
                                amountOutMin, 
                                tokenAInfo,
                                tokenBInfo,  
                                quoteInfo,
                                amountInWithoutFee, // for botfi swap
                                amountInWithFee, // for constructing the calldata payload
                                recipient
                            })

            //console.log("routeGroup===>", routeGroup)
            //console.log("swapDataObj===>", swapDataObj)
            
            // lets get swap contract
            let contracts = await web3.getSystemContracts()

            let swapFactory = contracts.swap.factory;


            //console.log("swapFactory===>", swapFactory)
            
            let { callDataArr, funcDataArr, iface } = swapDataObj

            let errMsg;

           for(let index in callDataArr) {

                let funcData = funcDataArr[index]
                let payload = callDataArr[index]

                try {

                    let result = await swapFactory.swap.estimateGas(
                                routeIdBytes32,
                                amountInWithoutFee,
                                tokenAInfo.contract,
                                payload,
                                { value: funcData.nativeValue }
                            )
                    console.log("result=====>", result)
                    return Status.successData(result)
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
        getPath
    }
}
    