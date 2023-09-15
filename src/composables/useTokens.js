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

export const useTokens = () => {

    const net = useNetworks()
    const _db = useDB()

    const getTokens = async (limit = null) => {

        let netInfo = await net.getActiveNetworkInfo()

        //console.log("netInfo===>", netInfo)

        let chainId = netInfo.chainId
        
        let db = await _db.getDB()

        let query =  db.tokens.where("chainId").equals(chainId)

        if(Number.isInteger(limit) && limit > 0){
            query = query.limit(limit)
        }

        let tokens = await query.toArray()

        //console.log("tokens===>", tokens)
        return tokens;
    }

    const getToken = async (id) => {

    }

    const getERC20TokenInfo = async (contract) => {

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
            {target: contract, abi: erc20Abi, label: "decimals", method: "decimals", args: [] },
        ]

        //0xdAC17F958D2ee523a2206206994597C13D831ec7
        let multicallStatus = await web3Conn.staticMulticall(inputs)
    } 

    const importToken = async (contract) => {
        
        if(!Utils.isAddress(contract)){
            return Status.error("Invalid contract address")
        }

        //lets get the web3 conn
        let web3ConnStatus = await net.getWeb3Conn()

        if(web3ConnStatus.isError()){
            return web3ConnStatus
        }

        let web3Conn = web3ConnStatus.getData()

        console.log("web3Conn===>", web3Conn)
    }

    return {
        getTokens,
        importToken,
        getERC20TokenInfo
    }
}