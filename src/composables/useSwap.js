/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import {ref, inject, computed, onBeforeMount, onBeforeUnmount, toRaw } from 'vue'
import { useDB } from "./useDB"
import Status from '../classes/Status';
import Utils from '../classes/Utils';
import { useNetworks } from "./useNetworks"
import EventBus from '../classes/EventBus';
import swapConfig from "../config/swap"
import { useNetwork } from '@vueuse/core';
import { Interface, decodeBytes32String, formatUnits, solidityPacked } from 'ethers';
import swapFunctionMap from "../config/swap/swap_function_map"

const supportedChains = swapConfig.supported_chains;
const $state = ref({
    isSupported: false,
    routes: {},
    contractsInfo: {}
})

export const useSwap =  () => {

    const networks = useNetworks()
    const netInfo = ref()

    const isSupported = computed(()=> $state.value.isSupported )
    const routes = computed(() => $state.value.routes)
    const contractsInfo = computed(() => $state.value.contractsInfo)

    onBeforeMount(() => {
        initialize()
    })

    const initialize = async () => {
        await isChainSupported()
    }

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
        let univ3Fee = 3000; // 0.3

        console.log("path====>", path)

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

            let protocolFee = swapConfig.protocol_fee * 100;

            let protocolFeeAmt = Utils.calPercentBPS(amountInBigInt, protocolFee)
    
            let amountInWithFee = amountInBigInt - protocolFeeAmt;

            let slippageBPS = slippage * 100

            let routesABIs = swapConfig.routes_ABIs;
    
            let quoteFunc = "get_amounts_out"
    
            let mcallInputs = []
            
    
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
            
            //let contracts = await web3.getSystemContracts()

            //let mcallAddr = contracts.swap.multicall3.address;
            
            let resultStatus =  await web3.multicall3(
                                    mcallInputs, 
                                   false
                                )
    
            if(resultStatus.isError()){
                return resultStatus
            }
    
            let resultData = resultStatus.getData() || []
        
            let processedQuotes = []
    
            for(let item of resultData) {
    
                let { label, data } = item; 
    
                if(data == null) continue;

                ///console.log("label===>", label)
    
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
                
                console.log("dataObj.amountOut===>", dataObj.amountOut)
                console.log("dataObj.formattedAmountOut===>", dataObj.formattedAmountOut)
                                                        
                console.log("amountOutWithSlippage===>",amountOutWithSlippage)
                console.log(" dataObj.formattedAmountOutWithSlippage===>",  dataObj.formattedAmountOutWithSlippage)

                // lets fetch the gas info 
                let gasEstimateStatus = await getSwapGasEstimate({
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
    
                processedQuotes.push(dataObj)
            }
    
            let sortedData = processedQuotes.sort(( item1, item2 ) => {
                if(item1.amountOut > item2.amountOut) return -1;
                else return 0
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
               // console.log("funcItem.args===>", funcItem.args)
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

            if(routeGroup != 'uni_v3') return;

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
            // lets get swap contract
            let contracts = await web3.getSystemContracts()

            let swapFactory = contracts.swap.factory;


            //console.log("swapFactory===>", swapFactory)
            
            let { callDataArr, funcDataArr, iface } = swapDataObj

           let result; 

           for(let index in callDataArr) {

                let funcData = funcDataArr[index]
                let payload = callDataArr[index]

                console.log("funcData====>", )
                console.log(funcData)

                console.log("tokenAInfo.contract===>", tokenAInfo.contract)

                try {

                    result = await swapFactory.swap.staticCall(
                                routeIdBytes32,
                                amountInWithoutFee,
                                tokenAInfo.contract,
                                payload,
                                { value: funcData.nativeValue }
                            )

                    console.log("result====>", result)
                } catch(e){
                    
                    //Utils.logError("useSwap#getSwapGasEstimate", e)

                    console.log("Route Group===>", routeInfo.parsedGroup)
                    console.log("e===>", e.code)

                    if(index == callDataArr.length - 1){
                        
                        let errData = e.data || null
                        let decodedError = null;

                        if(errData != null && !['0x','0x0'].includes(errData.toLowerCase())){
                            decodedError = iface.parseError(errData)
                        }

                        console.log("decodedError===>", decodedError)
                    }
                }
            } //end loop

            console.log("result===>", result)
        } catch(e){
            Utils.logError("useSwap#prepareSwap:",e)
            return Status.error(e.message)
        } 
    }

    return {
        isSupported,
        isChainSupported,
        routes,
        getRoutes,
        getSwapFunctionName,
        fetchQuotes,
        getPath
    }
}
    