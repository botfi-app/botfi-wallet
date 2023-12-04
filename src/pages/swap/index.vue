<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import { useWalletStore } from '../../store/walletStore';
import TokenSelectorModal from '../../components/modals/TokenSelectorModal.vue';
import Utils from '../../classes/Utils';
import SwapInputAndTokenSelect from '../../components/swap/SwapInputAndTokenSelect.vue';
import { Modal as bsModal } from 'bootstrap';
import BotFiLoader from "../../components/common/BotFiLoader.vue"
import swapConfig from "../../config/swap"
import  { useSwap } from '../../composables/useSwap';
import InlineError from '../../components/common/InlineError.vue';
import SwapSettings from '../../components/modals/SwapSettings.vue';
import { MaxUint256, parseUnits } from 'ethers';
import SwapQuotesModal from '../../components/modals/SwapQuotesModal.vue';
import ConfirmSwapModal from '../../components/modals/ConfirmSwapModal.vue';

let web3 = null;
let contracts;

const initialized   = ref(false)
const isLoading     = ref(false)
const pageError      = ref("")
const processingError = ref("")
const swapError = ref("")

const tokensCore        = useTokens()
const wallets           = useWalletStore()
const activeWallet     = ref()
const balanceInfo      = ref(null)

const networks      = useNetworks()
const netInfo       = ref()

const swapCore = useSwap()
const  { swapSetting } = swapCore
const slippage         = ref(swapSetting.value.slippage) 


const tokenA = ref(null)
const tokenB = ref(null)

const tokenAInputEl    = ref()
const tokenAInputValue = ref("")
const tokenAInputValueUint = ref()

const tokenBInputValue = ref("")

const activeTokenVarName = ref("tokenA")

const isFetchingQuotes = ref(false)
const quotesError = ref("")
const quotesDataArr = ref([])
const selectedQuoteIndex = ref(null)

const   isChainSupported = ref(false)
const   swapFactory = ref()
const   swapContracts = ref({})

const   hasInsufficientFunds = ref(true)
const   tokenApproved = ref(false)
const   isApprovingToken = ref(false)
const   txNonce = ref(null)
const   tokenSelector = ref(null)

const   isExecutingSwap = ref(false)
const   ignoreQuoteRefresh = ref(false)

const  refreshQuotesAfter = ref(30_000)
const  quoteUpdaterTimer  = ref(null)

const tokenASelectState = ref(Date.now())
const tokenBSelectState = ref(Date.now())

onBeforeMount(() => {
    initialize()
})

onBeforeUnmount(() => {
    stopQuoteUpdateTimer()
})

watch(swapSetting, () => {
    slippage.value = swapSetting.value.slippage
    fetchQuotes()
}, { deep: true })

watch(tokenA, () => {
    updateTokenAVars(true)
    tokenASelectState.value = Date.now()
}, { deep: true })

watch(tokenA, () => {
    tokenBSelectState.value = Date.now()
},{ deep: true })

watch(tokenAInputValue, () => {
    updateTokenAVars(false)
});


const stopQuoteUpdateTimer = () => {
    if(quoteUpdaterTimer.value){
        clearInterval(quoteUpdaterTimer.value)
        quoteUpdaterTimer.value = null
    }
}

const startQuotesUpdateTimer = () => {

    if(quoteUpdaterTimer.value != null) return;

    if(isFetchingQuotes.value){
        refreshQuotesAfter.value = 30_000
        return;
    }

    let counter = 1_000

    quoteUpdaterTimer.value = window.setInterval(() => {

        if(!canFetchQuotes()){
            stopQuoteUpdateTimer()
            return false;
        }
        
        refreshQuotesAfter.value -= counter;

        if(refreshQuotesAfter.value == 0){
            fetchQuotes()
            refreshQuotesAfter.value = 30_000
        }

    }, counter)
}

const updateTokenAVars = (updateBalance=false) => {
    
    if(!initialized) return;

    let tA = tokenA.value;
    let w = activeWallet.value.address.toLowerCase()
    hasInsufficientFunds.value = false

    if(!tA || !tA.balances) return false;
    
    if(updateBalance){
        balanceInfo.value = tA.balances[w]
    }

    let tAVal = tokenAInputValue.value.trim()
    let bal = balanceInfo.value["value"]


    if(tAVal != ""){
        tokenAInputValueUint.value = parseUnits(tAVal, tA.decimals)
    }

    let tAValUint = tokenAInputValueUint.value

    // lets check if token is approved 
    if(Utils.isNativeToken(tA.contract)){
        tokenApproved.value = true

        /// even if its equal the current amount, network fee comes in here for native tokens
        hasInsufficientFunds.value =  (tAValUint >= bal)

    } else {

        let allwn = tA.allowances[w]
        tokenApproved.value = (allwn >= tAValUint)
        hasInsufficientFunds.value =  (tAValUint > bal)

    }
    
   fetchQuotes()
}

const initWeb3 = async () => {

    let web3Status = await wallets.getWeb3Conn()

    if(web3Status.isError()){
       Utils.mAlert(`Failed to initialize network RPC: ${web3Status.getMessage()}`)
       return false
    }

    web3 = toRaw(web3Status.getData())

    //contracts = await web3.getSystemContracts()

   /// swapFactory.value = contracts.swap.factory;

    return web3
}

const initialize = async () => {


    if(!wallets.isLoggedIn()){
        return pageError.value = `Connect Wallet`
    }

    activeWallet.value = await wallets.getActiveWalletInfo()

    netInfo.value = await networks.getActiveNetworkInfo()
    tokenA.value = await tokensCore.getTokenByAddr(Utils.nativeTokenAddr)

    isChainSupported.value  = await swapCore.isChainSupported()

    if(!isChainSupported.value){
        return pageError.value = `Swap not supported on ${netInfo.value.name}`
    }

        
    swapContracts.value = await swapCore.getContractsAddrs(netInfo.value.chainId)

    ///console.log("swapContracts===>", swapContracts)


    // lets mimic the balances from TokenSelect modal
    let tA = tokenA.value

    if(tA){
        tokenA.value.balances = { 
            [activeWallet.value.address.toLowerCase()]: {
                value: tA.balanceInfo.balance,
                formatted: tA.balanceInfo.balanceDecimal
            }
        }
    }

    initWeb3()

    initialized.value = true  
}

const openTokenSelectModal = (tokenVarName) => {
    activeTokenVarName.value = tokenVarName
    bsModal.getInstance("#token-selector-modal").show()
}

const onTokenSelect = (token) => {

   // console.log("token===>", token)

    let tc = token.contract.toLowerCase()
    let tAc = (tokenA.value || {contract: ''}).contract.toLowerCase()
    let tBc = (tokenB.value || {contract: ''}).contract.toLowerCase()

    if(tc == tAc && tc == tBc) return; 

   if(activeTokenVarName.value == "tokenA"){
        if(tBc == tc) token = null
        tokenA.value = token;
   } else {
     if(tAc == tc) token = null
     tokenB.value = token
   }
    
   quotesDataArr.value = []

   fetchQuotes()
}   

const flipTokensData = () => {
    let tA = tokenA.value
    let tB = tokenB.value

    tokenA.value = tB 
    tokenB.value = tA 

    //remove quotes
    quotesDataArr.value = []
}

const canFetchQuotes = () => {
    if(hasInsufficientFunds.value || ignoreQuoteRefresh.value) return false;

    if(!tokenA.value || !(tokenA.value && tokenB.value)) return false;
    if(!Utils.isValidFloat(tokenAInputValue.value)) return false; 

    return true 
}

const fetchQuotes = async () => {

    if(!canFetchQuotes()) return false

    quotesError.value = ""

    if(isFetchingQuotes.value){
        while(true){
            await Utils.sleep(1)
            if(!isFetchingQuotes.value) break;
        }
    }

    stopQuoteUpdateTimer()

    if(web3 == null){
        if(!(await initWeb3())) return false 
    }
    
    
    isFetchingQuotes.value = true 

    //console.log("Helloo Booomm===>")

    let tokenAInfo = tokenA.value
    let tokenBInfo = tokenB.value;

    //lets now enocde the amount into tokenA's format
    let tokenAInputVal2 = parseUnits(tokenAInputValue.value.toString(), tokenAInfo.decimals)

    if(tokenAInputVal2 == 0) return;

    let recipient = activeWallet.value.address 

    let resultStatus =  await swapCore.fetchQuotes({
                            web3,
                            amountInBigInt: tokenAInputVal2,
                            tokenAInfo,
                            tokenBInfo,
                            slippage: slippage.value,
                            recipient
                        })

    isFetchingQuotes.value = false 

    if(resultStatus.isError()){
        quotesError.value = resultStatus.getMessage()
        return false
    }

    let resultsData = resultStatus.getData() || []

     //console.log("quotesDataArr ===>", resultsData )

    if(resultsData.length == 0){
        quotesError.value = "No Quote Available"
    } else {
        quotesDataArr.value = resultsData
        selectQuote(0)
    }

    // start quote updater
    startQuotesUpdateTimer()
}

const onTokenAInputReady = (input) => {
    tokenAInputEl.value = input
}

const setMaxBalance = (val) => {
    let input = tokenAInputEl.value 
    input["value"] = val
    input.dispatchEvent(new Event('change'))
}

const selectQuote = (index) => {
    fetchQuoteGasInfo(index)
    let quoteAmtOut = Utils.formatFiat(quotesDataArr.value[index].formattedAmountOutWithSlippage)
    tokenBInputValue.value = quoteAmtOut
    selectedQuoteIndex.value = index
}

const approveTokenSpend = async () => {
    
    let loader;

    try {

        let tA = tokenA.value
        loader = Utils.loader(`Approving ${tA.symbol.toUpperCase()}`)
        isApprovingToken.value = true 

        let spender = swapContracts.value.factory

        if(web3 == null){
            if(!(await initWeb3())) return false 
        }
        
        let resultStatus = await tokensCore.approveTokenSpend(web3, tA.contract, spender)

        loader.close()
        isApprovingToken.value = false 
        
        if(resultStatus.isError()){
            Utils.mAlert(resultStatus.getMessage())
            return false;
        }

        tokenA.value.allowances[activeWallet.value.address.toLowerCase()] = MaxUint256

        return true 
    } catch(e){
        Utils.logError("swap#approveTokenSpend:",e)
        Utils.mAlert("Failed to approve tokens")
    }
}

const handleOnSubmit = async () => {

    let loader; 
    ignoreQuoteRefresh.value = true

    try {
        let tAVal = tokenAInputValue.value 

        let quoteItemIndex = selectedQuoteIndex.value
        let quotesArr = quotesDataArr.value

        if(tAVal <= 0 || 
            quotesError.value != '' || 
            quotesArr.length == 0 ||
            quoteItemIndex == null ||
            !(quoteItemIndex in quotesArr)
        ) return;


        //lets check if the selected quote has gas estimate
        //let curQuoteInfo = quotesArr[curQuoteIdx]
    
        if(!tokenApproved.value){
            if(!(await approveTokenSpend())) return;
        }


        loader = Utils.loader("Initialising gas data..")

        if(!(await fetchQuoteGasInfo(quoteItemIndex))) return false 

        nextTick(() => {
            let intval = setInterval(() =>{
                let m = bsModal.getInstance("#confirm-swap-modal")
                
                if(!m || m == null) return;
                clearInterval(intval)
                m.show()
                loader.close()
            }, 100)
        })
            
    } catch(e) {
        if(loader) loader.close()
        Utils.mAlert(Utils.generalErrorMsg)
        Utils.logError("swap#handleOnSubmit:", e)
    } finally {
        if(loader) loader.close()
        ignoreQuoteRefresh.value = false
    }
}

const executeSwapTx =  async (dataObj) => {

    let loader; 
    ignoreQuoteRefresh.value = true

    try {

        loader = Utils.loader("Excuting Swap")
        //console.log("dataObj===>", dataObj)
        //lets perform the swap

        let { maxFeePerGas, gasLimit, nonce, maxPriorityFeePerGas } = dataObj

        let gasInfo = { 
            maxFeePerGas, 
            gasLimit,
            maxPriorityFeePerGas
        }
        
        let quoteInfo = quotesDataArr.value[selectedQuoteIndex.value]

        let resultStatus = await swapCore.executeSwap({
                            web3, 
                            quoteInfo, 
                            gasInfo, 
                            nonce,
                            tokenAInfo: tokenA.value, 
                            tokenBInfo: tokenB.value
                        })

        //console.log("resultStatus===>", resultStatus)

        if(resultStatus.isError()){
            return Utils.mAlert(resultStatus.getMessage())
        }

        //let tokenBAddr = tokenB.value.contract
        //let activeWalletAddr = activeWallet.value.address

        let { name, symbol, chainId, contract} = tokenB.value

        // lets update user's balance
        await tokensCore.importToken({
            name, symbol, chainId, contract
        });

        if(tokenSelector.value != null){
           // console.log("tokenSelector===>", tokenSelector)
          tokenSelector.value.reloadBalances().then(() => {

            let curDate = Date.now()
             nextTick(() => {
                let newTokenA = tokenSelector.value.getTokenInfo(tokenA.value.contract)
                
                console.log("newTokenA===>", newTokenA)
                
                if(newTokenA) {
                    tokenA.value = newTokenA
                    tokenASelectState.value = curDate
                }
                
                let newTokenB = tokenSelector.value.getTokenInfo(tokenB.value.contract)

                if(newTokenB) {
                    tokenB.value = newTokenB
                    tokenBSelectState.value = curDate
                }

                console.log("newTokenB===>", newTokenB)
             })
          })

        }

        let txData = resultStatus.getData() || {}

        let explorerUrl = await networks.getExplorer(chainId, `tx/${txData.hash}`)
        
        bsModal.getInstance("#confirm-swap-modal").hide()

        Utils.txAlert({
            text: "Swap Successful",
            icon: "swap_success_2.png",
            explorerUrl
        })
        
    } catch(e){
        Utils.mAlert(Utils.generalErrorMsg)
        Utils.logError("swap#executeSwap:", e)
    } finally{
        if(loader) loader.close()
        ignoreQuoteRefresh.value = false
    }
}

const getTotalQuoteText = () => {
    let len = quotesDataArr.value.length
    return `${len} Quote${(len) > 1 ? 's': ''} Found`
}

const fetchQuoteGasInfo = async (idx) => {

    let item = quotesDataArr.value[idx]

    let gas = item.gasLimit || null 

    if(gas != null) return true

    let data = await item.estimateGas()

    if(data == null){
        Utils.mAlert("Failed to fetch gas info for quote, try again later")
        return false;
    } 

    quotesDataArr.value[idx] = {...quotesDataArr.value[idx], ...data}

    return true
}
</script>
<template>
    <WalletLayout
        title="Swap"
        :showNav="true"
        :hasNetSelect="true"
        :hasAddrSelect="true"
        :pageError="pageError"
        :isLoading="!initialized"
        :hasFooter="true"
    >   
        <NativeBackBtn url="/wallet" />

        <div  class="swap-engine w-400 mb-5 pt-1 px-2">
            <div  class="mt-4 token-a">
                <div class="d-flex my-1 mx-1 justify-content-between align-items-center">
                    <div></div>
                    <div>
                        <button
                            class="mb-1 btn btn-info rounded-circle p-0 center-vh"
                            data-bs-toggle="modal" 
                            data-bs-target="#swapSettings"
                            @click.prevent
                            style="width: 22px; height: 22px;"
                        >
                            <Icon name="ant-design:setting-filled" :size="16" />
                        </button>
                    </div>
                </div>
                <div  :key="tokenASelectState">
                    <SwapInputAndTokenSelect
                        :tokenInfo="tokenA"
                        @open-token-select-modal="openTokenSelectModal('tokenA')"
                        @ready="onTokenAInputReady"
                        @input-change="v => tokenAInputValue = v"
                        :inputAttrs="{
                            focused: ''
                        }"
                        @balance-click="b => setMaxBalance(b.formatted)"
                    />
                </div>
            </div>
            <div class="center-vh w-full flip-btn-parent">
                <a href="#" 
                   @click.prevent="flipTokensData"
                   class="flip-btn center-vh rounded-lg"
                >
                    <Icon name="gg:arrows-exchange-alt-v" :size="24" />
                </a>
            </div>
            <div  class="token-b" :key="tokenBSelectState">
                <SwapInputAndTokenSelect
                    :tokenInfo="tokenB"
                    @open-token-select-modal="openTokenSelectModal('tokenB')"
                    :inputAttrs="{
                        disabled: true,
                        value: tokenBInputValue,
                        placeholder: ''
                    }"
                />
            </div>
    
            <div v-if="isFetchingQuotes" class="mb-4">
                <BotFiLoader
                    text="fetching Quotes"
                    size="loader-sm"
                />
            </div>
            <div v-else>
                <div v-if="quotesError != ''" class="mb-4 pb-4">
                    <InlineError 
                        :text="quotesError" 
                        :hasImage="false"
                        :has-title="false"
                        @retry="fetchQuotes"
                    />
                </div>
                <div v-else class="w-full mb-2">
                    <div style="position:relative; top: -20px;"
                    >
                        <div class="d-flex justify-content-end fs-12 fw-medium ls-1">
                            <div>
                                <div class="center-vh">
                                    <div>Slippage: {{ swapSetting.slippage }}%</div>
                                    <a href="#" 
                                        class="ms-1"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#swapSettings"
                                        @click.prevent
                                    >
                                        <Icon name="basil:edit-outline" class="text-info" />
                                    </a>
                                </div>
                                <div class="center-vh my-1">
                                    <div>Protocol Fee: {{ swapConfig.protocol_fee_percent }}%</div>
                                </div>
                            </div>
                        </div>
                        <div class="center-vh my-1" v-if="quotesDataArr.length > 0">
                            <div>
                                <div class="pt-2 pb-1 d-flex center-vh">
                                    <div>
                                        {{ getTotalQuoteText() }}
                                    </div>
                                    <a href="#" 
                                        class="btn btn-sm rounded-lg btn-warning ms-2"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#quotesModal"
                                        @click.prevent
                                    >View All</a>
                                </div>
                                <div class="fs-12 text-center text-upper fw-semibold hint ls-1" 
                                    v-if="canFetchQuotes()"
                                >
                                    Updates in <span class="text-success fw-bold">{{ refreshQuotesAfter / 1000 }}</span>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </div>
            <div class="">
                <button class="btn btn-success rounded-lg w-full" 
                    :disabled="isFetchingQuotes || quotesError != '' || hasInsufficientFunds"
                    @click="handleOnSubmit"
                >   
                    <div v-if="hasInsufficientFunds" class="fst-italic">Insufficient Funds</div>
                    <div v-else-if="isFetchingQuotes" class="fst-italic">Fetching Quotes..</div>
                    <div v-else-if="quotesError !=''" class="text-truncate">
                        {{ quotesError  }}
                    </div>
                    <div v-else-if="!tokenApproved">
                        Approve Token
                    </div>
                    <div v-else-if="isApprovingToken" class="fst-italic">
                        Approving Token..
                    </div>
                    <div v-else>
                        Swap
                    </div>
                </button>
            </div>

            <TokenSelectorModal 
                :includeVerified="true"
                :includeUserTokens="true"
                :tokenSpender="swapContracts.factory"
                @select="onTokenSelect"
                @init="item => tokenSelector = item"
            />
            <SwapSettings />
            <SwapQuotesModal
                :data="quotesDataArr"
                :key="quotesDataArr.length+'_'+(tokenA || {address: ''}).address"
                :tokenB="tokenB || {}"
                @select="selectQuote"
            />

            <ConfirmSwapModal 
                v-if="
                    selectedQuoteIndex != null && 
                    quotesDataArr.length > 0 && 
                    quotesDataArr[selectedQuoteIndex].gasLimit
                "
                :quoteInfo="quotesDataArr[selectedQuoteIndex]"
                :tokenA="tokenA"
                :tokenB="tokenB"
                :slippage="slippage"
                :amountIn="Number(tokenAInputValue)"
                :protocolFee="swapConfig.protocol_fee_percent"
                :txNonce="txNonce"
                @nonceChange="v => txNonce = v"
                @submit="executeSwapTx"
                @close="ignoreQuoteRefresh=false"
            />
        </div>

        
    </WalletLayout>
</template>
<style scoped lang="scss">
button[disabled] {
    background: #546e7a !important;
    color: #fff !important;
    border:none;
}
</style>