/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { inject, onBeforeMount, toValue } from "vue"
import { useDB } from "./useDB"
import { useNetworks } from "./useNetworks"
import Utils from "../classes/Utils"
import erc20Abi from "../data/abi/erc20.json"
import Status from "../classes/Status"
import { formatUnits, getAddress } from "ethers"

export const useTokens = () => {

    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")

    const getTokens = async (limit = null) => {

        let netInfo = await net.getActiveNetworkInfo()
        
        let chainId = netInfo.chainId
        let userId = botUtils.getUid()

        let db = await dbCore.getDB()

        let query =  db.tokens.where({chainId, userId })

        if(Number.isInteger(limit) && limit > 0){
            query = query.limit(limit)
        }

        let tokens = await query.toArray()

        //console.log("tokens===>", tokens)
        return tokens;
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

        console.log("inputs===>", inputs)

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
        
        let contract = tokenInfo.contract

        // check if the token exists first
        let existsInfo = await db.tokens.where({ 
                            chainId: tokenInfo.chainId, 
                            userId, 
                            contract: tokenInfo.contract 
                        }).first() || null

                        
        let id = (existsInfo != null)
                ? existsInfo.id
                : await db.tokens.put(tokenInfo)
  
        return Status.successData(id)
    }//end import 

    return {
        getTokens,
        importToken,
        getERC20TokenInfo
    }
}