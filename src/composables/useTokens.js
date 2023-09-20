/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { computed, inject, onBeforeMount, toValue, ref } from "vue"
import { useDB } from "./useDB"
import { useNetworks } from "./useNetworks"
import Utils from "../classes/Utils"
import erc20Abi from "../data/abi/erc20.json"
import Status from "../classes/Status"
import { formatUnits, getAddress } from "ethers"
import EventBus from "../classes/EventBus"
import Http from "../classes/Http"

export const useTokens = () => {

    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")

    const $state = ref({
        balances: []
    })

    const balances = computed(() => $state.balances )

    const getTokens = async (limit = null) => {

        try {
            let netInfo = await net.getActiveNetworkInfo()
            
            let chainId = netInfo.chainId
            let userId = botUtils.getUid()

            let db = await dbCore.getDB()

            let query =  await db.tokens.where({ chainId, userId })

            if(Number.isInteger(limit) && limit > 0){
                query = query.limit(limit)
            }

            let tokens = await query.toArray()

            //console.log("tokens===>", tokens)
            return tokens;
        } catch(e){
            console.log("useTokens#getTokens:",e, e.stack)
            return []
        }
    }

    const updateBalances = async (walletAddrs) => {

        try {

            ///console.log("addrsArr==>", addrsArr)

            if(window.__botFibalanceUpdating) return;

            window.__botFibalanceUpdating = true;

            let netInfo = await net.getActiveNetworkInfo()
            
            let chainId = netInfo.chainId

            //lets get the web3 conn
            let web3ConnStatus = await net.getWeb3Conn()

            if(web3ConnStatus.isError()){
                return web3ConnStatus
            }

            let web3Conn = web3ConnStatus.getData()

            let tokensArray = await getTokens()
            let contractsAddrs = []

            let inputs = []

            for(let index in tokensArray){

                let token = tokensArray[index]
                let contract = token.contract; 

                contractsAddrs.push(contract)

                for(let addr of walletAddrs) {

                    let label = `balanceOf_${index}_${contract}_${addr}`
                    
                    inputs.push({
                        target: contract, 
                        abi:    erc20Abi, 
                        label, 
                        method: "balanceOf", 
                        args: [addr] 
                    })
                }
            } //end 

            let nativeAddr = Utils.nativeTokenAddr

            for(let addr of walletAddrs) {
                inputs.push({
                    target: "", 
                    abi:    "", 
                    label:  `ethBalance_${addr}`, 
                    method: "getEthBalance", 
                    args:   [addr] 
                })
            }

            let resultStatus = await web3Conn.staticMulticall(inputs)

            if(resultStatus.isError()){
                Utils.logError("useToken#updateBalances:"+ resultStatus.getMessage())
                return resultStatus;
            }

            let resultData = resultStatus.getData() || {}

            let contracts = nativeAddr+","+contractsAddrs.join(",")

            //lets fetch the fiat conversion first
            let tokenPricesStatus = await Http.getApi("/contracts/prices", { chainId, contracts })

            let tokenPrices = {}

            if(!tokenPricesStatus.isError()){
                tokenPrices = tokenPricesStatus.getData() || {}
            }

            console.log("tokenPrices==>", tokenPrices)

            let bulkData = []

            // lets insert balances 
            for(let label of Object.keys(resultData)) {

                let balance = resultData[label]

                let labelSplit = label.split("_")

                let contract; 
                let walletAddr;
                let decimals;

                if(label.startsWith("balanceOf")){
                    
                    let tokenIndex = labelSplit[1]
                    contract =   labelSplit[2]
                    walletAddr = labelSplit[3]

                    let tokenInfo = tokensArray[tokenIndex]
                    decimals = tokenInfo.decimals

                } else if(label.startsWith("ethBalance")){
                    
                    walletAddr = labelSplit[1]
                    contract   = nativeAddr
                    decimals   = 18
                }

                let id = Utils.generateUID(`${walletAddr}-${contract}`)
                
                let balanceDecimal = formatUnits(balance, decimals)

                bulkData.push({
                    id,
                    token: contract,
                    wallet: walletAddr,
                    balance, 
                    balanceDecimal,
                    updatedAt: new Date
                })
            } //end foreach

            let db = await dbCore.getDB()

            await db.balances.bulkPut(bulkData)

        } catch(e){
            Utils.logError("useToken#updateBalances:", e)
        } finally {
            window.__botFibalanceUpdating = false
        }
    }

    const getERC20TokenInfo = async (contract, walletAddress = null) => {

        contract = toValue(contract)
        
        if(!Utils.isAddress(contract)){
            return Status.error("Invalid address")
        }

        //lets get the web3 conn
        let web3ConnStatus = await net.getWeb3Conn()

        if(web3ConnStatus.isError()){
            return web3ConnStatus
        }

        let web3Conn = web3ConnStatus.getData()

        let inputs = [
            {target: contract, abi: erc20Abi, label: "symbol", method: "symbol", args: [] },
            {target: contract, abi: erc20Abi, label: "name", method: "name", args: [] },
            {target: contract, abi: erc20Abi, label: "decimals", method: "decimals", args: [] }
        ]

        if(walletAddress != null && Utils.isAddress(walletAddress)){
            inputs.push({
                target: contract, 
                abi: erc20Abi, 
                label: "balanceOf", 
                method: "balanceOf", 
                args: [walletAddress] 
            })
        }

        ///console.log("inputs===>", inputs)

        let resultStatus = await web3Conn.staticMulticall(inputs)

        if(resultStatus.isError()){
            return resultStatus
        }

        let resultData = resultStatus.getData()


        if("balanceOf" in resultData){
            resultData.balanceOfDecimal = formatUnits(resultData.balanceOf, Number(resultData.decimals))
        }

        return Status.successData(resultData)
    } 

    const importToken = async (tokenInfo={}) => {
        
        for (let key of Object.keys(tokenInfo)){
            if(!['name','symbol', 'decimals', 'chainId','image', 'contract'].includes(key)){
                return Status.error(`unknown item ${key} in token info object`)
            }

            let value = (tokenInfo[key] || '').toString().trim()

            if(key != 'image' && value == ''){
                return Status.error(`${key} cannot be empty`)
            }

            if(['chainId', 'decimals'].includes(key) && parseInt(value) <= 0){
                return Status.error(`${key} requires an integer value`)
            }

            if(key == 'contract' && !Utils.isAddress(tokenInfo.contract)){
                return Status.error("Invalid contract address")
            }
        }

        tokenInfo.chainId  = parseInt(tokenInfo.chainId)
        tokenInfo.decimals = parseInt(tokenInfo.decimals)
        tokenInfo.contract = getAddress(tokenInfo.contract)

        let userId = botUtils.getUid()

        tokenInfo.userId = userId
        
        let db = await dbCore.getDB()
        
       // let contract = tokenInfo.contract

        // check if the token exists first
        let existsInfo = await db.tokens.where({ 
                            chainId: tokenInfo.chainId, 
                            userId, 
                            contract: tokenInfo.contract 
                        }).first() || null

                        
        let id = (existsInfo != null)
                ? existsInfo.id
                : await db.tokens.put(tokenInfo)

        EventBus.emit("update-balance")
  
        return Status.successData(id)
    }//end import 

    return {
        balances,
        getTokens,
        importToken,
        getERC20TokenInfo,
        updateBalances
    }
}