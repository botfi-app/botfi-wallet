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
import { Interface, getAddress, parseUnits } from 'ethers';


const web3 = ref()

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
const swapContracts = ref(null)

const tokenA = ref(null)
const tokenB = ref(null)

const tokenAInputValue = ref("")
const tokenBInputValue = ref("")

const activeTokenVarName = ref("tokenA")

const isFetchingQuotes = ref(false)

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


    web3.value = web3Status.getData()

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
    
    let routesStatus = await swapCore.getRoutes(web3.value)

    if(routesStatus.isError()){
        pageError.value = `Failed to fetch swap routes: ${routesStatus.getMessage()}`
        return false
    }

    swapRoutes.value = routesStatus.getData() || []

    return true
}

const fetchQuotes = async () => {
    try {

        isFetchingQuotes.value = true 

        await Utils.sleep(1)

        swapError.value = ""

        if(!(tokenA.value && tokenB.value)) return;

        if(!Utils.isValidFloat(tokenAInputValue.value)) return; 
        

        //lets now enocde the amount into tokenA's format
        let tokenAInputVal2 = parseUnits(tokenAInputValue.value.toString(), tokenA.decimals)

        if(tokenAInputVal2 == 0) return;

        let feeAmt = Utils.calPercentBPS(tokenAInputVal2, protocolFee.value)

        //console.log("feeAmt===>", feeAmt)

        let amountIn = tokenAInputVal2 - feeAmt;

        //console.log("tokenAInputVal2===>", tokenAInputVal2)

        let tokenAInfo = tokenA.value
        let tokenBInfo = tokenB.value;

        let routesABIs = swapConfig.routes_ABIs;

        let recipient = activeWallet.value.address;
        let deadline  = Math.ceil((Date.now() / 1000)) + 15;

        let tokenAddress = getAddress(tokenAInfo.contract)
        let tokenBAddress = getAddress(tokenBInfo.contract)

        let quoteFunc = "get_amounts_out"

        let mcallInputs = []

        for(let route of swapRoutes.value){

            let routeGroup = route.parsedGroup
            let routeId = route.pasedId;
            let abi;
            let target;

            if(Utils.isZeroAddr(route.quoter)) {
                abi = routesABIs[`${routeGroup}_router`]
                target = route.router;
            } else {
                abi = routesABIs[`${routeGroup}_quoter`]
                target = route.quoter;
            }

            let tokenAAddr = (Utils.isNativeToken(tokenAInfo.contract))
                            ? route.weth 
                            : tokenAInfo.contract

            let tokenBAddr = (Utils.isNativeToken(tokenBInfo.contract))
                                ? route.weth 
                                : tokenBInfo.contract

            let path = [tokenAAddr, tokenBAddr]

            let args = [];

            if(["uni_v2"].includes(routeGroup)){
                args = [amountIn, path]
            }
            else if(["tjoe_v20", "tjoe_v21"].includes(routeGroup)){
                args = [path, amountIn]
            } 
            else {
                continue;
            }

            let method =  await swapCore.getSwapFunctionName(routeGroup, quoteFunc)

            let label = `${routeId}|${routeGroup}`

            console.log("abi====>", abi)
            console.log("method=====>", method)
            console.log("args=====>", args)

            let iface = new Interface(abi);
            let data = iface.encodeFunctionData(method, args)

        } //end for loop 

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