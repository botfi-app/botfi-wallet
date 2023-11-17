<script setup>
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
import { Interface, formatUnits, getAddress, parseUnits, solidityPacked } from 'ethers';
import InlineError from '../../components/common/InlineError.vue';


let web3 = null;
let contracts;

const initialized   = ref(false)
const isLoading     = ref(false)
const pageError      = ref("")
const processingError = ref("")
const swapError = ref("")

const tokensCore    = useTokens()
const wallets       = useWalletStore()
const activeWallet     = ref()

const networks      = useNetworks()
const netInfo       = ref()

const swapCore = useSwap()

const tokenA = ref(null)
const tokenB = ref(null)

const tokenAInputValue = ref("")
const tokenBInputValue = ref("")

const activeTokenVarName = ref("tokenA")

const isFetchingQuotes = ref(false)
const quotesError = ref("")

const isChainSupported = ref(false)

const swapRoutes = ref([])

const protocolFee = ref(swapConfig.protocol_fee)

onBeforeMount(() => {
    initialize()
})

watch(tokenAInputValue, () => {
    fetchQuotes()
});

watch(tokenBInputValue, () => {
    fetchQuotes()
});

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

    let web3Status = await wallets.getWeb3Conn()

    if(web3Status.isError()){
        return pageError.value = `Failed to initialize network RPC: ${web3Status.getMessage()}`
    }

    //sconsole.log("swapConfig===>", swapConfig)


    web3 = toRaw(web3Status.getData())

    contracts = await web3.getSystemContracts()

    let fetchRoutes = await fetchSwapRoutes()

    if(!fetchRoutes) return false;

    initialized.value = true  
    
    //console.log("tokenA.value====>", tokenA.value)
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

    await Utils.sleep(1)

    quotesError.value = ""

    if(!(tokenA.value && tokenB.value)) return;

    if(!Utils.isValidFloat(tokenAInputValue.value)) return; 
    
    isFetchingQuotes.value = true 

    let tokenAInfo = tokenA.value
    let tokenBInfo = tokenB.value;

    //lets now enocde the amount into tokenA's format
    let tokenAInputVal2 = parseUnits(tokenAInputValue.value.toString(), tokenAInfo.decimals)

    if(tokenAInputVal2 == 0) return;

    let resultStatus =  await swapCore.fetchQuotes({
                            web3,
                            swapRoutes: swapRoutes.value,
                            amountInBigInt: tokenAInputVal2,
                            tokenAInfo,
                            tokenBInfo
                        })

    isFetchingQuotes.value = false 
    console.log("resultStatus===>", resultStatus)

    if(resultStatus.isError()){
        quotesError.value = resultStatus.getMessage()
        return false
    }


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
                <SwapInputAndTokenSelect
                    :tokenInfo="tokenA"
                    @open-token-select-modal="openTokenSelectModal('tokenA')"
                    :key="(tokenA || {}).contract"
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
                    :key="(tokenB || {}).contract+'-'+tokenBInputValue"
                    :inputAttrs="{
                        disabled: true,
                        value: tokenBInputValue,
                        placeholder: ''
                    }"
                />
            </div>

            <TokenSelectorModal 
                :includeVerified="true"
                :includeUserTokens="true"
                @select="onTokenSelect"
            />

            <div class="mb-4" v-if="isFetchingQuotes">
                <BotFiLoader
                    text="fetching Quotes"
                    size="loader-sm"
                />
            </div>
            <div v-else>
                <div v-if="quotesError != ''">
                    <InlineError :text="quotesError" />
                </div>
                <div v-else>

                </div>
            </div>
            <div>
                <button class="btn btn-success rounded-lg w-full" 
                    :disabled="swapError != ''"
                >
                    {{ (swapError != '') ? swapError : "Swap" }}
                </button>
            </div>
        </div>

        <BottomNav />
    </WalletLayout>
</template>