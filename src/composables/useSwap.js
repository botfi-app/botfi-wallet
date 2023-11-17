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
import { decodeBytes32String, formatUnits, solidityPacked } from 'ethers';
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

//if(path.length == 2){
            pathBytes = solidityPacked(
                            ["address", "uint24", "address"], 
                            [path[0], univ3Fee, path[1]]
                        )
/*} else {
            pathBytes = solidityPacked(
                            ["address", "uint24", "address", "uint24", "address"], 
                            [path[0], univ3Fee, path[1], univ3Fee, path[2]]
                        )
        }*/
        
        return pathBytes
    }


    const fetchQuotes = async({
        web3,
        swapRoutes,
        amountInBigInt,
        tokenAInfo,
        tokenBInfo
    }) => {
        try {

            let protocolFee = swapConfig.protocol_fee

            let protocolFeeAmt = Utils.calPercentBPS(amountInBigInt, protocolFee)
    
            let amountIn = amountInBigInt - protocolFeeAmt;

            let routesABIs = swapConfig.routes_ABIs;
    
            let quoteFunc = "get_amounts_out"
    
            let mcallInputs = []
            
    
            for(let route of swapRoutes){
    
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
                    args = [amountIn, path]
                }
                else if(["tjoe_v20", "tjoe_v21"].includes(routeGroup)){
                    args = [path, amountIn]
                } 
                else if (routeGroup == 'uni_v3'){
           
                    args = [path, amountIn]
    
                }
                else {
                    continue;
                }
    
                let method =  await getSwapFunctionName(routeGroup, quoteFunc)
    
                let label = `${routeId}|${routeGroup}`
    
                mcallInputs.push({ label, target, method, args, abi })
            } //end for loop 
            
            let contracts = await web3.getSystemContracts()

            let _mcallContract = contracts.swap.multicall3
            
            let resultStatus = await web3.multicall(_mcallContract)
                                      .staticcall(mcallInputs, false)
    
            if(resultStatus.isError()){
                return quotesError.value = `Failed to fetch quote: ${resultStatus.getMessage()}`
            }
    
            let resultData = resultStatus.getData() || []
        
            let processedQuotes = []
    
            for(let item of resultData) {
    
                let { label, data } = item; 
    
                if(data == null) continue;
    
                let [ routeId, routeGroup ] = label.split("|")
    
                let dataObj = {}
    
                dataObj['routeId'] = routeId
                dataObj['routeGroup'] = routeGroup
    
                let amountOut;
    
                if(["tjoe_v20", "tjoe_v21"].includes(routeGroup)){
                    
                    dataObj = {...dataObj, ...data.toObject()}
    
                    //console.log("dataObj====>", dataObj)
                    amountOut = Utils.lastArrayItem(dataObj.virtualAmountsWithoutSlippage) // get last item in the array
    
                    if(amountOut == null) continue; 
                } 
                else if(routeGroup == 'uni_v3') {
                    amountOut = data 
                } 
                else {
                    continue;
                }
    
                dataObj.amountOut = amountOut
                dataObj.formattedAmountOut = formatUnits(amountOut, tokenBInfo.decimals)
    
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
    