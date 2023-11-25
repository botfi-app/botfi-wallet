<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { onBeforeMount, ref, toRaw, watch } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import { useWalletStore } from '../../store/walletStore';
import TokenSelectorModal from '../../components/modals/TokenSelectorModal.vue';
import Utils from '../../classes/Utils';
import Image from '../../components/common/Image.vue';
import SwapInputAndTokenSelect from '../../components/swap/SwapInputAndTokenSelect.vue';
import { Modal as bsModal } from 'bootstrap';
import BotFiLoader from "../../components/common/BotFiLoader.vue"
import swapConfig from "../../config/swap"
import  { useSwap } from '../../composables/useSwap';
import InlineError from '../../components/common/InlineError.vue';
import SwapSettings from '../../components/modals/SwapSettings.vue';
import { parseUnits } from 'ethers';
import { useSettings } from '../../composables/useSettings';
import SwapQuotesModal from '../../components/modals/SwapQuotesModal.vue';

let web3 = null;
let contracts;

const initialized   = ref(false)
const isLoading     = ref(false)
const pageError      = ref("")
const processingError = ref("")
const swapError = ref("")

const settings = useSettings()

const tokensCore        = useTokens()
const wallets           = useWalletStore()
const activeWallet     = ref()
const balanceInfo      = ref(null)
const slippage         = ref(swapConfig.default_slippage) 

const networks      = useNetworks()
const netInfo       = ref()

const swapCore = useSwap()

const tokenA = ref(null)
const tokenB = ref(null)

const tokenAInputEl    = ref()
const tokenAInputValue = ref("")

const tokenBInputEl = ref()
const tokenBInputValue = ref("")

const activeTokenVarName = ref("tokenA")

const isFetchingQuotes = ref(false)
const quotesError = ref("")
const quotesDataArr = ref([])
const selectedQuote = ref(0)

const   isChainSupported = ref(false)
const   swapRoutes = ref([])
const   swapFactory = ref()
const   isApprovingToken = ref(false)


onBeforeMount(() => {
    initialize()
})

watch(tokenA, () => {

    if(!tokenA.value) return false;

    balanceInfo.value = tokenA.value.balances[activeWallet.value.address.toLowerCase()]

   // console.log(" balance.value====>",  balance.value)
}, { deep: true })

watch(tokenAInputValue, () => {
    fetchQuotes()
});


const initialize = async () => {


    if(!wallets.isLoggedIn()){
        return pageError.value = `Connect Wallet`
    }

    let swapSettings = await settings.fetchSettings("swap") || {}

    if("slippage" in swapSettings){
        slippage.value = swapSettings.slippage
    }

    activeWallet.value = await wallets.getActiveWalletInfo()

    netInfo.value = await networks.getActiveNetworkInfo()
    tokenA.value = await tokensCore.getTokenByAddr(Utils.nativeTokenAddr)

    isChainSupported.value  = await swapCore.isChainSupported()

    if(!isChainSupported.value){
        return pageError.value = `Swap not supported on ${netInfo.value.name}`
    }

    let web3Status = await wallets.getWeb3Conn()

    if(web3Status.isError()){
        return pageError.value = `Failed to initialize network RPC: ${web3Status.getMessage()}`
    }

    //sconsole.log("swapConfig===>", swapConfig)
    //console.log(tokenA.value)

    web3 = toRaw(web3Status.getData())

    contracts = await web3.getSystemContracts()

    swapFactory.value = contracts.swap.factory;


    console.log("swapFactory.value===>", swapFactory.value)

    let fetchRoutes = await fetchSwapRoutes()

    if(!fetchRoutes) return false;

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

    initialized.value = true  
    
   // console.log("tokenA.value====>", tokenA.value)
}

const openTokenSelectModal = (tokenVarName) => {
    activeTokenVarName.value = tokenVarName
    bsModal.getInstance("#token-selector-modal").show()
}

const onTokenSelect = (token) => {

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
    
   fetchQuotes()
}   

const flipTokensData = () => {
    let tA = tokenA.value
    let tB = tokenB.value

    tokenA.value = tB 
    tokenB.value = tA 

    fetchQuotes()
}

const fetchSwapRoutes = async () => {
    
    let routesStatus = await swapCore.getRoutes(web3)

    if(routesStatus.isError()){
        pageError.value = `Failed to fetch swap routes: ${routesStatus.getMessage()}`
        return false
    }

    swapRoutes.value = routesStatus.getData() || []

    return true
}

const fetchQuotes = async () => {

    if(isFetchingQuotes.value) return false;
    
    quotesDataArr.value = []
    quotesError.value = ""

    if(!tokenA.value ) return false;
    if(!(tokenA.value && tokenB.value)) return false;

    if(!Utils.isValidFloat(tokenAInputValue.value)) return false; 
    
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
                            swapRoutes: swapRoutes.value,
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

    /// console.log("quotesDataArr ===>", resultsData )

    if(resultsData.length == 0){
        quotesError.value = "No liquidity"
    } else {
        quotesDataArr.value = resultsData
        selectQuote(0)
    }
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
    let quote = Utils.formatFiat(quotesDataArr.value[index].formattedAmountOutWithSlippage)
    tokenBInputValue.value = quote
    selectedQuote.value = index
}
</script>
<template>
    <WalletLayout
        title="Swap"
        :showNav="true"
        :hasNetSelect="true"
        :hasAddrSelect="true"
        :pageError="pageError"
    >   
        <NativeBackBtn url="/wallet" />

        <div  class="swap-engine w-400 mb-5 pt-1 px-2">
            <div  class="mt-4 token-a">
                <div class="d-flex my-1 mx-1 justify-content-between align-items-center">
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
                    <div v-if="tokenA != null && balanceInfo != null" class="fs-14 fw-medium ls-1">
                        <a href="#" 
                            @click.prevent="setMaxBalance(balanceInfo.formatted)"
                        >
                            Max: {{ Utils.formatFiat( balanceInfo.formatted ) }} {{ tokenA.symbol }}
                        </a>
                    </div>
                </div>
                <SwapInputAndTokenSelect
                    :tokenInfo="tokenA"
                    @open-token-select-modal="openTokenSelectModal('tokenA')"
                    @ready="onTokenAInputReady"
                    @input-change="v => tokenAInputValue = v"
                    :inputAttrs="{
                        focused: ''
                    }"
                />
            </div>
            <div class="center-vh w-full flip-btn-parent">
                <a href="#" 
                   @click.prevent="flipTokensData"
                   class="flip-btn center-vh rounded-lg"
                >
                    <Icon name="gg:arrows-exchange-alt-v" :size="24" />
                </a>
            </div>
            <div  class="token-b">
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
                        class="d-flex justify-content-end fs-12 fw-medium ls-1"
                    >
                        <div>
                            <div class="center-vh">
                                <div>Slippage: {{ slippage }}%</div>
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
                                <div>Protocol Fee: {{ swapConfig.protocol_fee }}%</div>
                            </div>
                            <div class="center-vh my-1" v-if="quotesDataArr.length > 0">
                                <div>
                                    Quotes: 
                                    <span class='btn fs-12 btn-success rounded fw-semibold p-0 px-1'>AGG</span> - 
                                    <a href="#" 
                                        class="text-info"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#quotesModal"
                                        @click.prevent
                                    >View All</a>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </div>
            <div class="">
                <button class="btn btn-success rounded-lg w-full" 
                    :disabled="isFetchingQuotes || quotesError != ''"
                >
                    <div v-if="isFetchingQuotes" class="fst-italic">Fetching Quotes..</div>
                    <div v-else-if="quotesError !=''" class="text-truncate">
                        {{ quotesError  }}
                    </div>
                    <div v-else-if="isApprovingToken" class="fst-italic">
                        Approving {{ tokenB.symbol.toUperCase() }}..
                    </div>
                    <div v-else>
                        Swap
                    </div>
                </button>
            </div>

            <TokenSelectorModal 
                :includeVerified="true"
                :includeUserTokens="true"
                :tokenSpender="swapFactory.target"
                @select="onTokenSelect"
            />
            <SwapSettings
                :slippage="slippage"
            />
            <SwapQuotesModal
                :data="quotesDataArr"
                :key="quotesDataArr.length+'_'+(tokenA || {address: ''}).address"
                :tokenA="tokenA"
                :tokenB="tokenB"
                @select="selectQuote"
            />
        </div>

        <BottomNav />
    </WalletLayout>
</template>
<style scoped lang="scss">
button[disabled] {
    background: #546e7a !important;
    color: #fff !important;
    border:none;
}
</style>