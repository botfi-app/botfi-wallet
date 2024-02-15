/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { computed } from "vue"
// { useDB } from "./useDB"
import { useNetworks } from "./useNetworks"
import Utils from "../classes/Utils"
import { MaxUint256, formatUnits } from "ethers"
import { Interface as ethersInterface } from "ethers"
import methodSigs from "../data/abi_sigs/evm.js"
import { useTokens } from "./useTokens"

export const useTx = () => {

    const netCore   = useNetworks()
    const tokenCore = useTokens()

    const decodeTxData = async (txInfo) => {

       try {

            let txData = txInfo.data || null

            if(['0x', null].includes(txData)){
                return null
            }

            console.log("txData====>", txData)

            let _methodSig = txData.substring(0, 10)

            let methodInfo = methodSigs[_methodSig] || null 

            if(methodInfo == null) return null;

            //lets now fetch the data 
            let iface = new ethersInterface([`function ${methodInfo.abi}`])
            let decoded = iface.parseTransaction({ data: txData })

            //console.log("decoded====>", decoded)

            let methodName = methodInfo.name;

            let contractAddr = txInfo.to;
            let tokenInfo = null;

            // if the method is approve or transfer, lets get the token info
            if(["transfer", "approve"].includes(methodName)){
                
                //lets fetch token info 
                let tokenInfoStatus = await tokenCore.getERC20TokenInfo(contractAddr)

                if(!tokenInfoStatus.isError()){
                    tokenInfo = tokenInfoStatus.getData()
                }
            }

            let args = decoded.args || []

            let methodArgs = []

            for(let index in args) {

                let argName = methodInfo.params[index]
                let argValue = args[index]

                let argData = {
                    argName,
                    argValue
                }
               

                if(["transfer", "approve"].includes(methodName) && tokenInfo != null){
                    if(argName == 'amount'){
                        let argValueFormatted = formatUnits(argValue, tokenInfo.decimals)
                        argData["argValueFormatted"] = `${argValueFormatted} ${tokenInfo.symbol.toUpperCase()}`
                    }
                }

                methodArgs.push(argData)
            }

            return { 
                    methodName,  
                    methodArgs, 
                    tokenInfo, 
                    infoText: methodInfo.text || "", 
                    warningText: methodInfo.warning || ""
            }

        } catch(e){
            Utils.logError("useTx#decodeTxData:", e)
            throw e;
        }

    }


    return {
        decodeTxData
    }
}