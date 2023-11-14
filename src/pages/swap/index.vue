<script setup>
import { onBeforeMount, ref, watch } from 'vue';
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
import { parseUnits } from 'ethers';


const web3 = ref()

const initialized   = ref(false)
const isLoading     = ref(false)
const pageError      = ref("")
const processingError = ref("")
const swapError = ref("")

const tokensCore    = useTokens()
const wallets       = useWalletStore()
//const { isSupported: isSwapSupported }      = useSwap()
const networks      = useNetworks()
const netInfo       = ref()

const swapCore = useSwap()
const swapContracts = ref(null)

const tokenA = ref(null)
const tokenB = ref(null)

const tokenAInputValue = ref("")
const tokenBInputValue = ref("")

const activeTokenVarName = ref("tokenA")

const isFetchingQuotes = ref(false)

const isChainSupported = ref(false)

const swapRoutes = ref()

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

    //console.log("swapConfig===>", swapConfig)

    if(!wallets.isLoggedIn()){
        return pageError.value = `Connect Wallet`
    }

    netInfo.value = await networks.getActiveNetworkInfo()
    tokenA.value = await tokensCore.getTokenByAddr(Utils.nativeTokenAddr)

    isChainSupported.value  = await swapCore.isChainSupported()

    if(!isChainSupported.value){
        return pageError.value = `BotFi swap is not supported on ${netInfo.value.name}`
    }

    let web3Status = await wallets.getWeb3Conn()

    if(web3Status.isError()){
        return pageError.value = `Failed to initialize network RPC: ${web3Status.getMessage()}`
    }

    web3.value = web3Status.getData()

    let fetchRoutes = await fetchSwapRoutes()

    if(!fetchRoutes) return;


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
    
    let routesStatus = await swapCore.getRoutes(web3.value)

    if(routesStatus.isError()){
        pageError.value = `Failed to fetch swap routes: ${routesStatus.getMessage()}`
        return false
    }

    swapRoutes.value = routesStatus.getData()

    return true
}

const fetchQuotes = async () => {
    try {

        isFetchingQuotes.value = true 

        await Utils.sleep(1)

        swapError.value = ""

        if(!(tokenA.value || tokenB.value)) return;

        if(!Utils.isValidFloat(tokenAInputValue.value)) return; 
        

        //lets now enocde the amount into tokenA's format
        let tokenAInputVal2 = parseUnits(tokenAInputValue.value.toString(), tokenA.decimals)

        if(tokenAInputVal2 == 0) return;

        //console.log("tokenAInputVal2===>", tokenAInputVal2)

        let tokenAInfo = tokenA.value
        let tokenBInfo = tokenB.value;

        let routesABIs = swapConfig.routes_ABIs;

        let mCallInputs = []


        for(let route of swapRoutes.value){

            let abi;
            let _dataArr = []

            if(["uni_v2", "tjoe_v20", "tjoe_v21"].includes(route.group)){
                
                abi = routesABIs[route.group]

                if(Utils.isNativeToken(tokenAInfo.contract)){
                    _dataArr.push({
                        func: swapCore.getSwapFunctionName("swap_exact_native_for_tokens")
                    })
                    _dataArr.push({
                        func: swapCore.getSwapFunctionName("swap_exact_native_for_tokens_with_transfer_tax")
                    })
                } 
                else if(Utils.isNativeToken(tokenBInfo.contract)) {
                    _dataArr.push({
                        func: swapCore.getSwapFunctionName("swap_exact_native_for_tokens")
                    })
                    _dataArr.push({
                        func: swapCore.getSwapFunctionName("swap_exact_native_for_tokens_with_transfer_tax")
                    })
                }
            }

            let swapFunction = swapCore.getSwapFunctionName(route.group)
            
        }

    } catch(e){
        processingError.value = "Failed to fetch quotes, try again"
        Utils.logError("swap#index#fetchQuotes:",e)
    } finally {
        //isFetchingQuotes.value = false
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