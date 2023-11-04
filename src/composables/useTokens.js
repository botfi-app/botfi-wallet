/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { computed, inject, onBeforeMount, toValue, ref, toRaw } from "vue"
import { useDB } from "./useDB"
import { useNetworks } from "./useNetworks"
import { useActivity } from "./useActivity"
import Utils from "../classes/Utils"
import erc20Abi from "../data/abi/erc20.json"
import Status from "../classes/Status"
import { formatUnits, getAddress, parseUnits } from "ethers"
import EventBus from "../classes/EventBus"
import Http from "../classes/Http"
import { useSettings } from "./useSettings"
import { useWalletStore } from "../store/walletStore"
import { Interface as ethersInterface } from "ethers"

const $state = ref({
    tokens: {},
    dataState: Date.now()
})


export const useTokens = () => {

    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")
    const { fetchSettings } = useSettings()
    const { getWalletAddresses } = useWalletStore()
    const activityCore = useActivity()

    const updateDataState = () => {
        $state.value.dataState = Date.now()
    }

    onBeforeMount(async () =>{
        await getTokens()
        updateDataState()
    })

    const tokens    = computed(() =>  $state.value.tokens )
    const updatedAt = ref(Date.now())
    const dataState = computed(() => $state.value.dataState )

    const getNativeTokenInfo = async () => {

        let netInfo = await net.getActiveNetworkInfo()

        let image =  netInfo.icon || ""

        if("icon" in netInfo.nativeCurrency && netInfo.nativeCurrency.icon.trim() != ""){
            image = netInfo.nativeCurrency.icon || "";
        }

        return {
            ...netInfo.nativeCurrency,
            image,
            chainId: netInfo.chainId,
            contract: Utils.nativeTokenAddr
        }
    }

    const getTokens = async (limit=null) => {

        try {

            //console.log("Calling getTokens")

            let netInfo = await net.getActiveNetworkInfo()
            
            let chainId = netInfo.chainId
            let userId = botUtils.getUid()

            let db = await dbCore.getDB()

            let tokensArr =  await db.tokens.where({ chainId, userId })
                                .reverse()
                                .sortBy("createdAt")

            let tokensObj = {}

            tokensObj[Utils.nativeTokenAddr] = await getNativeTokenInfo()

            
            tokensArr.forEach(item => {

                if(!item.balanceInfo || Object.keys(item.balanceInfo).length == 0){
                    item.balanceInfo =  { balance: 0n, balanceDecimal: "0.0", balanceFiat: {} }
                }

                tokensObj[item.contract] = item 
            })

            // lets get the token balances 
            let balancesArr = await db.balances.where({ chainId, userId }).toArray()

            for(let balance of balancesArr){
                if(balance.token in tokensObj){
                    tokensObj[balance.token].balanceInfo = balance
                }
            }

            $state.value.tokens = tokensObj;

            let tokensCount = tokensArr.length + 1 // the +1 is the native token

            if(limit != null && Number.isInteger(limit) && tokensCount > (limit+1)) {
                let slicedItems = Object.fromEntries(
                    Object.entries(tokensObj).slice(0,limit+1)
                )
                return slicedItems
            }

            //console.log("Calling getTokens===>", tokensObj)

            return tokensObj;
        } catch(e){
            console.log("useTokens#getTokens:",e, e.stack)
            return {}
        }
    }


    const updateBalances = async (walletAddrs, force=false) => {

        try {

            if(!walletAddrs || walletAddrs.length == 0) {
                walletAddrs = await getWalletAddresses()
            }

            //console.log("walletAddrs==>", walletAddrs)

            if(window.__botFibalanceUpdating && !force) return Status.success();

            window.__botFibalanceUpdating = true;

            let netInfo = await net.getActiveNetworkInfo()
            
            let chainId = netInfo.chainId
            let userId = botUtils.getUid()

            let db = await dbCore.getDB()

            //lets get the web3 conn
            let web3ConnStatus = await net.getWeb3Conn()

            if(web3ConnStatus.isError()){
                return web3ConnStatus
            }

            let web3Conn = web3ConnStatus.getData()
            
            let tokensArray = await db.tokens.where({ chainId, userId }).toArray()

            let contractsAddrs = []

            let inputs = []

            let balanceHasChanged = false
            let balanceChangesInfo = {}

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

            // user settings 
            let settings = await fetchSettings()

            let defaultCurrency = settings.defaultCurrency || "USD"

            let queryParams = {
                currency: defaultCurrency,
                chainId,
                contracts
            }

            //lets fetch the fiat conversion first
            let tokenPricesStatus = await Http.getApi("/contracts/prices", queryParams)

            let tokenPricesData = {}

            if(!tokenPricesStatus.isError()){
                tokenPricesData = tokenPricesStatus.getData() || {}
            }

            //console.log("tokenPricesData==>", tokenPricesData)

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

                let balanceFiat = {}
                let tokenPriceObj;

                let tokenPriceInfo = tokenPricesData[contract.toLowerCase()] || null

                let id = Utils.generateUID(`${userId}-${chainId}-${walletAddr}-${contract}`)
                
                let balanceDecimal = formatUnits(balance, decimals)

                if(tokenPriceInfo) {

                    tokenPriceObj = tokenPriceInfo.price || {}

                    //console.log("tokenPriceObj===>", tokenPriceObj)

                    for(let key of Object.keys(tokenPriceObj)){
                        let price = parseFloat(tokenPriceObj[key] || 0)
                        balanceFiat[key] = price * parseFloat(balanceDecimal)
                    }
                }

                let oldBalanceInfo = await db.balances.get({wallet: walletAddr, token: contract})

                if(oldBalanceInfo != null){
                    //console.log("oldBalanceInfo==>", oldBalanceInfo)
                    if(oldBalanceInfo.balance != balance){
                        balanceHasChanged = true
                    }
                }

                bulkData.push({
                    id,
                    token: contract,
                    wallet: walletAddr,
                    balance, 
                    balanceDecimal,
                    balanceFiat,
                    price: tokenPriceObj,
                    userId,
                    chainId,
                    updatedAt: new Date
                })
            } //end foreach


            await db.balances.bulkPut(bulkData)

            let tokens = await getTokens()

            updateDataState()

            EventBus.emit("balance-updated", tokens)

            if(balanceHasChanged){
                await fetchPastTxByBlocks(web3Conn, { tokensAddrs: contractsAddrs, walletAddrs })
            }

            return Status.success()

        } catch(e){
            Utils.logError("useToken#updateBalances:", e)
            return Status.error(`balance update failed: ${e.message}`)
        } finally {
            window.__botFibalanceUpdating = false
        }
    }

    const fetchPastTxByBlocks = async (web3Conn, { tokensAddrs = [], walletAddrs = [] }) => {
        try {

            let resultStatus = await web3Conn.getPastTxByBlocks()

            //console.log("tokensAddrs==>", tokensAddrs)
            //console.log("walletAddrs==>", walletAddrs)

            if(resultStatus.isError()){
                return resultStatus;
            }

            let txDataArr = resultStatus.getData() || []

            let iface = new ethersInterface(erc20Abi)
            let filteredTxArr = []
             
            for(let tx of txDataArr){
                
                tx = {...tx}

                if(!['0x', '', null].includes(tx.data.trim())){

                    if(!tokensAddrs.includes(tx.to)) continue

                    //decoded data
                    let dd = iface.parseTransaction({ data: tx.data, value: tx.value });

                    //console.log("dd===>", dd)

                    if(!dd || typeof dd != 'object') continue

                    if(!("args" in dd) || dd.args == null) continue

                    let [recipient, amountUint] = (dd.args || [])

                    let transferSig = '0xa9059cbb'

                    if([transferSig].includes(dd.selector)  && 
                        (walletAddrs.includes(recipient) || walletAddrs.includes(tx.from))
                    ){
                        
                        tx.isERC20 = true
                        tx.isNative = false
                        tx.tokenContract = tx.to
                        tx.tokenRecipient = recipient
                        tx.tokenAmount = amountUint
                        tx.activityType = 'token_transfer'

                        if(walletAddrs.includes(recipient)){
                            tx.transferType = "receive"
                            filteredTxArr.push(tx)
                        }

                        if(walletAddrs.includes(tx.from)){
                            tx.transferType = "send"
                            filteredTxArr.push(tx)
                        }

                       // console.log("tx===>", tx)
                       // console.log("dd===>>>", dd)
                    }
                }  
                else if (walletAddrs.includes(tx.to) && tx.value > 0n) {
                   
                    tx.isNative = true
                    tx.isERC20 = false
                    tx.activityType = 'token_transfer'
                    
                    if(walletAddrs.includes(tx.to)){
                        tx.transferType = "receive"
                        filteredTxArr.push(tx)
                    }

                    if(walletAddrs.includes(tx.from)){
                        tx.transferType = "send"
                        filteredTxArr.push(tx)
                    }
                }
            }

            //console.log("filteredTxArr ==>", filteredTxArr)

            if(filteredTxArr.length == 0) return Status.success()

            //console.log("filteredTxArr ==>", filteredTxArr)

            for(let tx of filteredTxArr){

                let recipient;
                let sender = tx.from;
                let amount;
                let contractAddr;

                //console.log("tx===>", tx)

                if(tx.isERC20) {
                    
                    recipient = tx.tokenRecipient
                    amount = tx.tokenAmount
                    contractAddr = tx.tokenContract
   
                } else if(tx.isNative){
                    recipient = tx.to;
                    amount = tx.value
                    contractAddr = Utils.nativeTokenAddr
                } else {
                    continue
                }


                let transferType = tx.transferType;

                let wallet = (transferType == 'send')
                                ? sender
                                : recipient


                let tokenInfo = await getTokenByAddr(contractAddr)
                let tokenSymbol = tokenInfo.symbol;

                let amountDecimal = formatUnits(amount, tokenInfo.decimals)

                let extraInfo = {
                    rawTxInfo: tx, 
                    sender,
                    recipient,
                    token: contractAddr,
                    amount,
                    amountDecimal,
                    transferType,
                    tokenSymbol
                }   
                /*
                console.log("wallet===>", wallet)
                console.log("transfer===>", transferType)
                console.log("extraInfo===>", extraInfo)
                console.log("tx===>", tx)
                */

                let activityType = tx.activityType;
                
                let title;

                if(activityType == 'token_transfer'){
                    title = (transferType == 'send') 
                            ?`sent_{tokenSymbol}`
                            : "received_{tokenSymbol}"

                } else if(activityType == 'token_approval'){
                    title = `approved_${tokenSymbol}`
                }
    
                await activityCore.saveActivity({
                    title,
                    titleParams:    { tokenSymbol },
                    wallet, 
                    chainId:        Number(tx.chainId),
                    activityType,
                    contract:       contractAddr,
                    hash:           tx.hash, 
                    txDate:        (tx.timestamp || null),
                    extraInfo          
                })
                
            }
        } catch(e) {
            Utils.logError("useToken#fetchTxHistory:", e)
            return Status.error(`balance update failed: ${e.message}`)
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

            if(!['name','symbol', 'decimals', 'chainId','image', 'contract', 'geckoId'].includes(key)){
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

    /**
     * remove Token
     */
    const removeToken = async (tokenInfo) => {
        try {

            let netInfo = await net.getActiveNetworkInfo()
            
            let chainId = netInfo.chainId
            let userId = botUtils.getUid()

            let db = await dbCore.getDB()

            let contract = tokenInfo.contract;

            let deleteCount =  await db.tokens.where({ contract, chainId, userId }).delete()

            if(deleteCount == 1 && "balanceInfo" in tokenInfo) {
                let balanceId = tokenInfo.balanceInfo.id;
                await db.balances.where({ id: balanceId }).delete() 
            }
            
            //lets get the tokens 
            let _tokens = await getTokens()

            return Status.successData(_tokens)
        } catch(e){
            Utils.logError("useToken#removeToken:", e)
            return Status.error(Utils.generalErrorMsg)
        }
    }

    const getTokenByAddr = async (contract) => {
        
        if(Object.keys(tokens.value).length == 0){
            await getTokens()
        }

        return tokens.value[contract] || null
    }

    const geTokenFiatValue = async (tokenAddr, tokenAmt) => {

        tokenAmt = toValue(tokenAmt)
        tokenAddr = toValue(tokenAddr)
        
        let settings  = await fetchSettings()
        
        let defaultCurrency = (settings.defaultCurrency || "usd").toLowerCase()

        let tokenInfo = await getTokenByAddr(tokenAddr)

        if(tokenInfo == null) return null

        let balanceInfo = tokenInfo.balanceInfo || {}

        if(!("price" in balanceInfo) || balanceInfo.price == null){
            return null
        }

        let tokenPrice = balanceInfo.price[defaultCurrency] || null

        if(tokenPrice == null) return null

        let value = (tokenPrice * parseFloat(tokenAmt))

       // console.log("tokenAmt===>", tokenAmt)
        //console.log("value====>", value)

        if(value == null || value == NaN) return value
        
        if(value.toString().length > 8){
            value = parseFloat(value).toFixed(8)
        }

        return { value, symbol: defaultCurrency }
    }


    const removeUsersTokensAndBalances = async () => {
        let userId = botUtils.getUid()
        let db = await dbCore.getDB()
        await db.tokens.where({ userId }).delete()
        await db.balances.where({ userId }).delete()
        return Status.successPromise()
    }

    return {
        getTokens,
        importToken,
        getERC20TokenInfo,
        updateBalances,
        tokens,
        updatedAt,
        tokensDataState: dataState,
        removeToken,
        getTokenByAddr,
        geTokenFiatValue,
        removeUsersTokensAndBalances
    }
}