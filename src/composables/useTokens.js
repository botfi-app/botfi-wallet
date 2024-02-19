/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { computed, inject, onBeforeMount, toValue, ref, toRaw, watch } from "vue"
import { useDB } from "./useDB"
import { useNetworks } from "./useNetworks"
import { useActivity } from "./useActivity"
import Utils from "../classes/Utils"
import erc20Abi from "../data/abi_min/erc20.js"
import Status from "../classes/Status"
import { MaxUint256, ZeroAddress, formatEther, formatUnits, getAddress, parseEther, parseUnits } from "ethers"
import EventBus from "../classes/EventBus"
import Http from "../classes/Http"
import { useSettings } from "./useSettings"
import { useWalletStore } from "../store/walletStore"
import { Interface as ethersInterface } from "ethers"
import ErrorCodes from "../classes/ErrorCodes.js"
import GeckoApi from "../classes/GeckoApi.js"

const $state = ref({
    tokens: {},
    dataState: Date.now()
})


export const useTokens = () => {

    const net = useNetworks()
    const { activeNetwork } = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")
    const { fetchSettings } = useSettings()

    //console.log("botUtils===>", botUtils)

    const { 
        getWalletAddresses, 
        getActiveWalletInfo, 
        activeWallet
    } = useWalletStore()
    const activityCore = useActivity()

    const updateDataState = () => {
        $state.value.dataState = Date.now()
    }

    const _activeWallet = computed(() => activeWallet)

    onBeforeMount(async () =>{
        await getTokens(true)
        updateDataState()
    })

    watch(_activeWallet, async () => {
        await getTokens(true)
        updateDataState()
    })

    watch(activeNetwork, async () => {
        //console.log("Network Changed====>")
        $state.value.tokens = {}
        await getTokens(true)
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

    const getTokens = async (force=true) => {

        try {

            //console.log("Calling getTokens")
            let tokensObj = $state.value.tokens

            if(Object.keys(tokensObj) == 0 || force){

                let netInfo = await net.getActiveNetworkInfo()
                
                let chainId = netInfo.chainId
                let userId = botUtils.getUid()

                let db = await dbCore.getDB()

                let tokensArr =  await db.tokens.where({ chainId, userId })
                                    .reverse()
                                    .sortBy("createdAt")

                // add the native token to the top of the data
                tokensArr.unshift((await getNativeTokenInfo()))

                let balancesObj = await getUserBalances()

                let _activeWallet =  (await getActiveWalletInfo()) || {}

                //console.log("_activeWallet====>", _activeWallet)

                let walletAddr = (_activeWallet.address || "").toLowerCase()

                //console.log("balancesObj====>", balancesObj)

                tokensArr.forEach(item => {

                    let token = item.contract;

                    ///console.log("balancesObj====>", balancesObj)
                    
                    let tokenBalances = (balancesObj[token.toLowerCase()] || {})

                    let walletBalanceInfo = tokenBalances[walletAddr] || {}

                    if(!walletBalanceInfo || Object.keys(walletBalanceInfo).length == 0){
                        walletBalanceInfo =  { 
                            balance: BigInt(0), 
                            balanceDecimal: "0.0", 
                            balanceFiat: {} 
                        }
                    }

                    item.balanceInfo = walletBalanceInfo

                    //console.log("item.balanceInfo===>", item.balanceInfo)
                    tokensObj[token] = item 
                })

                $state.value.tokens = tokensObj;
            }

            //let tokensCount = Object.keys(tokensObj).length  // the +1 is the native token

            /*if(limit != null && Number.isInteger(limit) && tokensCount > (limit+1)) {
                let slicedItems = Object.fromEntries(
                    Object.entries(tokensObj).slice(0,limit+1)
                )
                return slicedItems
            }*/

            //console.log("Calling getTokens===>", tokensObj)

            return tokensObj;
        } catch(e){
            console.log("useTokens#getTokens:",e, e.stack)
            return {}
        }
    }

    const getUserBalances = async () => {


        let netInfo = await net.getActiveNetworkInfo()
            
        let chainId = netInfo.chainId
        let userId = botUtils.getUid()

        let db = await dbCore.getDB()

        // lets get the token balances 
        let balancesArr = await db.balances.where({ chainId, userId }).toArray()
        let processedBalances = {}

        for(let item of balancesArr){

            item.value = item.balance; 
            item.formatted = item.balanceDecimal;

            let token = item.token.toLowerCase()
            let balanceInfo = processedBalances[token] || {}

            balanceInfo[item.wallet.toLowerCase()] = item

            processedBalances[token] = balanceInfo
        }

        return processedBalances
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
            let tokensObj = {}

            let contractsAddrs = []

            let inputs = []

            let balanceHasChanged = false
            let balanceChangesInfo = {}

            for(let index in tokensArray){

                let token = tokensArray[index]
                let contract = token.contract; 

                tokensObj[contract] = token;

                contractsAddrs.push(contract)

                for(let addr of walletAddrs) {
                    
                    inputs.push({
                        token: contract, 
                        account: addr
                    })
                }
            } //end 

            //native addr
            let nativeAddr = Utils.nativeTokenAddr

            // lets include native tokens 
            for(let addr of walletAddrs) {
                inputs.push({
                   token: ZeroAddress,
                   account: addr
                })
            }

            //console.log("inputs===>", inputs)

            let resultStatus = await web3Conn.getBalances(inputs)

            if(resultStatus.isError()){
                Utils.logError("useToken#updateBalances:"+ resultStatus.getMessage())
                return resultStatus;
            }

            let balancesArr = resultStatus.getData() || []

            //console.log("balancesArr====>", balancesArr)

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
            for(let i in balancesArr) {

                let balance =  balancesArr[i]
                let item = inputs[i]

                //console.log("balance===>", balance)

                let contract = item.token;
                let walletAddr = item.account;
                let decimals;

               if(contract == ZeroAddress){
                    decimals   = 18
                    contract = Utils.nativeTokenAddr
                } else {
                    decimals = tokensObj[contract].decimals
                }

                let balanceFiat = {}
                let tokenPriceObj;

                ///console.log("contract===>", contract)

                let tokenPriceInfo = tokenPricesData[contract.toLowerCase()] || null

                let idStr = `${userId}-${chainId}-${walletAddr}-${contract}`

                ///console.log("idStr===>", idStr)

                let id = Utils.generateUID(idStr)
                
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

            //console.log("bulkData===>", bulkData)

            //no need to wait for it
            db.balances.bulkPut(bulkData).then(async () => {
                await getTokens(true)
                updateDataState()
                window.__botFibalanceUpdating = false
            })

           //console.log("result===>", result)

            EventBus.emit("balance-updated", tokens)

            if(balanceHasChanged){
                fetchPastTxByBlocks(web3Conn, { tokensAddrs: contractsAddrs, walletAddrs })
            }

            return Status.success()

        } catch(e){
            window.__botFibalanceUpdating = false
            Utils.logError("useToken#updateBalances:", e)
            return Status.error(`balance update failed: ${e.message}`)
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
                else if (walletAddrs.includes(tx.to) && tx.value > BigInt(0)) {
                   
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

    const getERC20TokenInfo = async (
        contract= null, 
        wallet = null, 
        spender = null
    ) => {
        
        contract = toValue(contract)

        //console.log("contract===>", contract)
        
        if(contract == null || !Utils.isAddress(contract)){
            return Status.error("Invalid contract address")
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
           // {target: contract, abi: erc20Abi, label: "totalSupply", method: "totalSupply", args: [] }
        ]

        if(wallet != null && Utils.isAddress(wallet)){
            inputs.push({
                target: contract, 
                abi: erc20Abi, 
                label: "balanceOf", 
                method: "balanceOf", 
                args: [wallet] 
            })

            if(spender != null && Utils.isAddress(spender)){
                inputs.push({
                    target: contract, 
                    abi:    erc20Abi, 
                    label: `allowance`, 
                    method: "allowance", 
                    args: [wallet,spender] 
                })
            }
        }


        let resultStatus = await web3Conn.multicallToObj(inputs)

        if(resultStatus.isError()){
            return resultStatus
        }

        let resultObj = resultStatus.getData() || {}

        if("balanceOf" in resultObj){
            resultObj.balanceOfDecimal = formatUnits(
                                resultObj.balanceOf, 
                                Number(resultObj.decimals)
                        )
        }

        return Status.successData(resultObj)
    } 


    //////////FETCH BULK TOKENS INFO ////////////
    // query chain in chunks as deployless has data limit
    const  getBulkERC20TokenInfo  = async (
        tokensArr=[], 
        walletsArr=[],
        spender = null
    ) => {

        let tokensChunks = Utils.arrayChunk(tokensArr, 50)

        //console.log("tokensChunks===>", tokensChunks)

        let requests = [] 

        tokensChunks.forEach(chunk => (
            requests.push(__getBulkERC20TokenInfo(chunk, walletsArr, spender))
        ))

        let resultArr = await Promise.all(requests)

        //console.log("resultArr=====>", resultArr)

        let finalResults = {}

        for(let resultStatus of resultArr){
            if(resultStatus.isError()) {
                return resultStatus
            }

            let dataArr = resultStatus.getData() || []

            //console.log("dataArr===>", dataArr)

            finalResults = {...finalResults, ...dataArr}
        }

        return Status.successData(finalResults)
    }

    const __getBulkERC20TokenInfo = async (
        tokensArr=[], 
        walletsArr=[], 
        spender=null
    ) => {

         //lets get the web3 conn
         let web3ConnStatus = await net.getWeb3Conn()

         if(web3ConnStatus.isError()){
             return web3ConnStatus
         }
 
         let web3 = web3ConnStatus.getData()

         let abi = erc20Abi
         let inputs = []

        for(let i  in tokensArr){
            
            let target = tokensArr[i]

            inputs.push({target, abi, label: `symbol_${i}`, method: "symbol", args: [] })
            inputs.push({target, abi, label: `name_${i}`, method: "name", args: [] })
            inputs.push({target, abi, label: `decimals_${i}`, method: "decimals", args: [] })
            

            if(walletsArr.length > 0){
                walletsArr.forEach(wallet => {
                    
                    let label = `balanceOf_${i}_${wallet}`
                    let method = "balanceOf"
                    
                    inputs.push({target, abi, label, method, args: [wallet] })

                    if(spender != null && Utils.isAddress(spender)){
                        inputs.push({
                            target, 
                            abi, 
                            label: `allowance_${i}_${wallet}`, 
                            method: 
                            "allowance", 
                            args: [wallet,spender] 
                        })
                    }

                })
            }

        }
        
        let resultStatus = await web3.multicall3(inputs)

        if(resultStatus.isError()) return resultStatus

        let resultsArr = resultStatus.getData() || []

        //console.log("resultsObj===>", resultsObj)

        let processedData = {}

        for(let i in resultsArr) {

            let item  = resultsArr[i]

            let label = item.label 

            let labelObj= label.split("_")

            let value = item.data
            
            let [method, index] = labelObj
            let wallet;

            if(['balanceOf', 'allowance'].includes(method)){
                wallet = labelObj[2]
            }

            let token = tokensArr[index];
            let tokenLower = token.toLowerCase()
           
            let tokenItem = processedData[tokenLower] || { balances: {}, allowances: {}}

            if(method == 'balanceOf'){
                tokenItem.balances[wallet.toLowerCase()] = value
            }
            else if(method == 'allowance') {
                tokenItem.allowances[wallet.toLowerCase()] = value
            }
            else {
                tokenItem[method.toLowerCase()] = value;
            }

            processedData[tokenLower] = tokenItem
        }

       Object.keys(processedData).forEach(tokenAddr => {
            
            let tInfo = processedData[tokenAddr]

            //console.log("tInfo==>", tInfo)
            
            Object.keys(tInfo.balances).forEach(walletAddr => {
                let balance = tInfo.balances[walletAddr] || null 
                let formatedBalance = formatUnits(balance || 0, tInfo.decimals)
                tInfo.balances[walletAddr] = { value: balance, formatted: formatedBalance}
            })

            processedData[tokenAddr] = tInfo
       })  
       
       //console.log("processedData===>", processedData)

       return Status.successData(processedData)
    }

    const getNativeTokensBalancesBulk = async (wallets=[]) => {
        try {

            let inputs = []

            for(let i in wallets){
                let addr = wallets[i]
                inputs[i] = ({
                    token: ZeroAddress,
                    account: addr
                })
            }

            //lets get the web3 conn
            let web3ConnStatus = await net.getWeb3Conn()

            if(web3ConnStatus.isError()){
                return web3ConnStatus
            }

            let web3Conn = web3ConnStatus.getData()

            let resultStatus = await web3Conn.getBalances(inputs)

            if(resultStatus.isError()){
                Utils.logError("useToken#updateBalances:"+ resultStatus.getMessage())
                return resultStatus;
            }

            let dataArr = resultStatus.getData() || []

            
            let results = {}
            
            for(let i in wallets){
                let addr = wallets[i].toLowerCase()

                let balance = dataArr[i]
                results[addr] = {
                    value: balance,
                    formatted: formatEther(balance)
                }
            }

            return Status.successData(results)
        } catch(e){
            Utils.logError("useTokens#getNativeTokenBalanceBulk:",e)
            return Status.error("failed to fetch native balance")
        }
    }

    /**
     * approve token spend
     * @param {*} web3 
     * @param {*} token 
     * @param {*} spender 
     * @returns 
     */
    const approveTokenSpend = async (web3, token, spender) => {
        let contract = web3.contract(token, erc20Abi)
        return contract.sendTx("approve", [spender, MaxUint256])
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
     * process import erc20 token
     */
    const processImportERC20Token = async (dataObj) => {

        let loader;

        try {

            const { 
                contract, 
                chainId, 
                wallet,
                image = "" 
            } = dataObj;

                
            if(!Utils.isAddress(contract)){
                return Status.error(`Invalid address '${contract}'`)
                             .setCode(ErrorCodes.WATCH_ASSET_INVALID_ADDRESS)
            }

            loader = Utils.loader("Verifying token contract onchain")

            let verifyStatus = await getERC20TokenInfo(contract, wallet)

            if(verifyStatus.isError()){
                return Status.error(verifyStatus.getMessage())
                            .setCode(ErrorCodes.internal)
            }

            let tokenInfo = verifyStatus.getData()

            let action =   await Utils.getSwal().fire({
                                showCancelButton:   true,
                                confirmButtonText:  'Import',
                                denyButtonText:     'Cancel',
                                html: Utils.getImportConfirmHtmlMsg(tokenInfo),
                                title: "Confirm Action",
                            })

            if(!action.isConfirmed){
                 return Status.error("User Rejected Request")
                            .setCode(ErrorCodes.userRejectedRequest)
            }

            loader = Utils.loader("Processing...")

            let dbTokenInfoStatus = await Http.getApi("/contracts/token-info", { chainId, contract })


            if(!dbTokenInfoStatus.isError()){
                let dbTokenInfo = dbTokenInfoStatus.getData()

                if(dbTokenInfo != null){
                    tokenInfo.geckoId = dbTokenInfo.geckoId || "";

                    // let uriEnd
                    //lets get gecko coin info
                    let geckoCoinInfoStatus = await GeckoApi.getCoinInfo(tokenInfo.geckoId)

                    if(!geckoCoinInfoStatus.isError()){
                        let geckoCoinInfo = geckoCoinInfoStatus.getData()

                        //console.log("geckoCoinInfo===>", geckoCoinInfo)
                        let images = geckoCoinInfo.image || {}

                        if("large" in images) {
                            tokenInfo.image = images.large
                        }
                    }

                }
            }

            if(!("image" in tokenInfo) && Utils.isValidUrl(image)){
                tokenInfo.image = image
            }

            //tokenInfo.image = item.image
            tokenInfo.contract = contract
            tokenInfo.chainId = chainId
            delete tokenInfo.balanceOf;
            delete tokenInfo.balanceOfDecimal;

            // lets now import the token 
            return importToken(tokenInfo)

        } catch(e){
            Utils.logError("useTokens#processImportERC20Token: ", e)
            return Status.error("Failed to import token")
                         .setCode(ErrorCodes.internal)
        } finally {
            if(loader) loader.close()
        }
    }

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

    const getNativeToken = async () => {
        return getTokenByAddr(Utils.nativeTokenAddr)
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
        processImportERC20Token,
        getERC20TokenInfo,
        updateBalances,
        getUserBalances,
        tokens,
        updatedAt,
        tokensDataState: dataState,
        removeToken,
        getTokenByAddr,
        geTokenFiatValue,
        removeUsersTokensAndBalances,
        getBulkERC20TokenInfo,
        approveTokenSpend,
        getNativeToken,
        getNativeTokensBalancesBulk
    }
}