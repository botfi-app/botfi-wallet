<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Utils from "../../classes/Utils"
import { useTokens } from '../../composables/useTokens'
import { useNetworks } from '../../composables/useNetworks';
import EthUriParser from "../../classes/EthUriParser"
import Status from "../../classes/Status"
import { useSettings } from '../../composables/useSettings'
import { Contract, formatUnits } from "ethers";
import { useWalletStore } from '../../store/walletStore'

const props = defineProps({
    id: { type: String, required: true },
    title: { type: String, default: "Confirm Action" },
    recipient: { type: String, required: true },
    tokenType: { type: String, required: true },
    tokenInfo: { type: Object, required: true },
    amount: { type: String, required: true },
    amountUint: { type: null, required: true },
})

import erc20Abi from "../../data/abi/erc20.json"

const initialized = ref(false)
const { getTokenByAddr, geTokenFiatValue } = useTokens()
const { getWeb3Conn } = useWalletStore()
const feeData = ref()
const gasLimit = ref(null)
const selectedGasPrice = ref(null)
const gasFeeInETHUint = ref(null)
const gasFeeInETH = ref(null)
const errorMsg = ref("")
const isLoading = ref(false)
const loadingText = ref("")
const balanceInfo = ref(null)
const finalAmount = ref(null)
const finalAmountUint = ref(null)

const nativeTokenInfo = ref(null)
const nativeTokenBalanceInfo = ref(null)
const hasInsufficientNativeToken = ref(false)

const finalAmountFiat = computed(() => (
    (finalAmount == null) 
        ? null 
        : geTokenFiatValue(props.tokenInfo.contract, finalAmount)  
))

let web3Conn = null;

const onShow = (mElement, mInstance) => {
    initialize()
}

watch(selectedGasPrice, () => {

    let txGasFee = selectedGasPrice.value * gasLimit.value

    gasFeeInETHUint.value = txGasFee
    gasFeeInETH.value = formatUnits(txGasFee, 18)
});

const processFeeAndFinalAmount = async () => {

    let p = props;
    let balance = balanceInfo.value.balance;

    console.log("p.tokenType===>>>>>>", p.tokenInfo)

    //if native token
    if(p.tokenType == 'native') {

        nativeTokenInfo.value = p.tokenInfo
        nativeTokenBalanceInfo.value = balanceInfo.value
        
        if(gasFeeInETHUint.value >= p.amountUint){
            return  hasInsufficientNativeToken.value = true
        }

        if(p.amountUint == balance){
            finalAmountUint.value = p.amountUint - gasFeeInETHUint.value
        } else {
            finalAmountUint.value = p.amountUint
        }

        if(finalAmountUint.value <= 0n) {
            return hasInsufficientNativeToken.value = true
        }

        finalAmount.value = formatUnits(finalAmountUint.value, p.tokenInfo.decimals)

    } else { // if not native

        finalAmount.value = p.amount
        finalAmountUint.value = p.amountUint

        //lets fetch native token 
        nativeTokenInfo.value = await getTokenByAddr(Utils.nativeTokenAddr)

        let nativeBalance = nativeTokenInfo.value.balanceInfo
        nativeTokenBalanceInfo.value = nativeBalance

        if(nativeBalance.balance < gasFeeInETHUint.value){
            return hasInsufficientNativeToken.value = true
        }
    }
}

const initialize = async () => {
    try{

        balanceInfo.value = props.tokenInfo.balanceInfo;

        initialize.value = false
        isLoading.value = true 

        loadingText.value = "Initializing gas data"

        let web3ConnStatus = await getWeb3Conn()

        if(web3ConnStatus.isError()){
            return errorMsg.value = web3ConnStatus.getMessage()
        }

        web3Conn = web3ConnStatus.getData()

        let gasInfoStatus = await fetchGasInfo()

        if(gasInfoStatus.isError()){
            return errorMsg.value = gasInfoStatus.getMessage()
        }

        await processFeeAndFinalAmount()

        initialize.value = true 

    } catch(e) {

        Utils.logError("ConfirmTokenSend#initialize:", e)
        errorMsg.value = Utils.generalErrorMsg

    } finally {
        isLoading.value = false
    }
}


const getGasLimit = async () => {
    
    try {

        let p = props;

        if(p.tokenType == 'native') {
            
            let gasEstimateStatus = await web3Conn.getETHGasEstimate({ 
                                        to: p.recipient,
                                        value: p.amountUint
                                    })

            if(gasEstimateStatus.isError()){
                return gasEstimateStatus
            }

            gasLimit.value = gasEstimateStatus.getData() || 21_000n

        } 
        else if(p.tokenType == 'erc20'){

            let contract =  web3Conn.contract(p.tokenInfo.contract, erc20Abi)
            gasLimit.value = await contract.transfer.estimateGas(p.recipient, p.amountUint)

        }

        return Status.successData(gasLimit) 
    } catch(e){
        Utils.logError("ConfirmTokenSend#getGasLimit:", e)
        return Status.errorPromise("Failed to fetch gas limit")
    }
}

const fetchFeeData = async () => {

    let resultStatus = await web3Conn.getFeeData()

    if(resultStatus.isError()) {
        return resultStatus
    }

    let fd = {...resultStatus.getData()}

      /// gasFeeInEth.value = 
    if(fd.maxFeePerGas == null){
        fd.maxFeePerGas = fd.gasPrice
    }

    if(fd.maxPriorityFeePerGas == null){
        fd.maxPriorityFeePerGas = fd.maxFeePerGas
    }

    feeData.value = fd

    return Status.successData(fd)
}


const fetchGasInfo = async () => {

    let resulstArr = await (Promise.all([fetchFeeData(), getGasLimit() ]))

    //console.log("resulstArr===>", resulstArr)

    for(let resultStatus of resulstArr){
        if(resultStatus.isError()){
            return resultStatus
        }
    }

    console.log("feeData.value===>", feeData.value)

    // lets set the gas price here
    selectedGasPrice.value = feeData.value.maxFeePerGas

    return Status.success()
}
</script>
<template>
    <Modal
        :id="props.id"
        :title="props.title"
        :has-header="true"
        :has-footer="false"
        @show="onShow"
    >
        <template #body>
            <div class="p-2">
                <LoadingView :isLoading="isLoading" :loadingText="loadingText">
                    <div class="p-2 center-vh text-center">
                        <div>
                            <div class="fs-11 hint fw-semibold text-upper">
                                Final Amount
                            </div>
                            <div class="fw-medium fs-3 text-truncate">
                                {{ finalAmount }} {{ props.tokenInfo.symbol }}
                            </div>
                            <div v-if="finalAmountFiat">
                                {{ finalAmountFiat }}
                            </div>
                        </div>
                    </div>
                </LoadingView>
            </div>
        </template>
    </Modal>

</template>