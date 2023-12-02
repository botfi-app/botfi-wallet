<script setup>
import {  ref, onBeforeMount, watch } from "vue";
import Utils from "../../classes/Utils"
import { useTokens } from '../../composables/useTokens'
import GasFeePicker from "../common/GasFeePicker.vue"
import NonceEditor from "../common/NonceEditor.vue";

const p = defineProps({
    quoteInfo:      { type: Object, required: true },
    amountIn:       { type: Number, required: true },
    protocolFee:    { type: Number, required: true },
    txNonce:         { type: null, required: true },
    slippage:       { type: Number, required: true },
    tokenA:         { type: Object, required: true },
    tokenB:         { type: Object, required: true }
})

const emit = defineEmits(["submit", "nonceChange"])

const initialized = ref(false)
const id = ref("confirm-swap-modal")
const mbodyTopMargin = ref(0)
const { getNativeToken } = useTokens()
const nativeTokenInfo = ref({})
const nativeTokenSymb = ref("")

const txMaxFeePerGas      = ref(null)
const txPriorityFeePerGas = ref(null)

const txGasLimit         =  ref(p.quoteInfo.gasLimit)
const txTotalFeeUint     = ref(null)
const txTotalFeeDecimals = ref(null)
const gasFeeInFiat       = ref(null)

const txNonce = ref(p.txNonce)

//console.log("p====>", p)

watch(txNonce, () => {
    emit("nonceChange", txNonce.value)
})

onBeforeMount(async () => {

    nativeTokenInfo.value = await getNativeToken()
    //txGasLimit.value = p.quoteInfo.gasLimit
    nativeTokenSymb.value = nativeTokenInfo.value.symbol.toUpperCase()

    initialized.value = true
})

const onShow = async () => {
   // txGasLimit.value = p.quoteInfo.gasLimit
   // gasTokenSymb.value = nativeTokenInfo.value.symbol.toUpperCase()
   //console.log("p.quoteInfo ===>", p.quoteInfo)
  // console.log("txGasLimit===>", txGasLimit)
}

const  onGasPriceChange = (data={}) => {

let { 
    name, 
    maxFeePerGas, 
    totalFee, 
    totalFeeDecimals,
    maxPriorityFeePerGas,  
    gasLimit 
} = data

    txGasLimit.value         = gasLimit
    txMaxFeePerGas.value     = maxFeePerGas 
    txTotalFeeUint.value     = totalFee
    txTotalFeeDecimals.value = totalFeeDecimals
    txPriorityFeePerGas.value = maxPriorityFeePerGas

}

const  handleOnSubmit= async () => {
    emit("submit", { 
        gasLimit:             txGasLimit.value,
        maxFeePerGas:         txMaxFeePerGas.value,
        totalFeeUint:         txTotalFeeUint.value,
        totalFeeDecimals:     txTotalFeeDecimals.value,
        maxPriorityFeePerGas: txPriorityFeePerGas.value,
        nonce:                txNonce.value
    })
}
</script>
<template>
    <Modal
        :id="id"
        title="Confirm Swap"
        :has-header="true"
        :has-footer="false"
        :onShow="onShow"
        v-if="initialized"
    >
        <template #body>
            <div id="gasfee-picker-container"></div>
            <div :class="`p-2 confirm-tx-modal mt-${mbodyTopMargin}`">

                <div class="m-2 details rounded-lg py-3  px-4">
                    <div class="d-flex  justify-content-between my-3 align-items-center">
                        <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                            Swap
                        </div>
                        <div class="text-end fs-14 fw-medium">
                            {{ amountIn }} {{ tokenA.symbol.toUpperCase() }}
                        </div>
                    </div>

                    <div class="d-flex  justify-content-between my-3 align-items-center">
                        <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                            For
                        </div>
                        <div class="text-end fs-14 fw-medium">
                            {{ p.quoteInfo.formattedAmountOutWithSlippage }} {{ tokenB.symbol.toUpperCase() }}
                        </div>
                    </div>
                    <div class="d-flex  justify-content-between my-3 align-items-center">
                        <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                            Slippage
                        </div>
                        <div class="text-end fs-14 fw-medium">
                            {{ p.slippage }}%
                        </div>
                    </div>
                    <div class="d-flex  justify-content-between my-3 align-items-center">
                        <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                            Protocol Fee
                        </div>
                        <div class="text-end fs-14 fw-medium">
                            {{ p.protocolFee }}%
                        </div>
                    </div>
                </div>
                <div class="m-2 details rounded-lg py-3  px-4">
                    <div v-if="nativeTokenInfo != null" 
                        class="d-flex  justify-content-between my-3 align-items-center my-3"
                    >
                        <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                            Network Fee
                        </div>
                        <div class="d-flex ps-3 fw-middle">
                            <div class="fs-14 text-end center-vh text-break">
                                <div style="max-width: 180px;">
                                    {{  Utils.formatCrypto(txTotalFeeDecimals) }} {{ nativeTokenSymb }}
                                </div>
                                <div v-if="gasFeeInFiat != null">
                                    ({{ Utils.formatFiat(gasFeeInFiat.value) }} {{ gasFeeInFiat.symbol.toUpperCase() }})
                                </div>
                                <GasFeePicker
                                    v-if="p.quoteInfo.gasLimit"
                                    :nativeTokenInfo="nativeTokenInfo"
                                    :feeData="p.quoteInfo.feeData"
                                    :gasLimit="txGasLimit"
                                    :onChainGasLimit="p.quoteInfo.gasLimit"
                                    selected="market"
                                    placement="top"
                                    container="#gasfee-picker-container"
                                    @change="onGasPriceChange"
                                    @show="() => mbodyTopMargin = 0"
                                    @hide="() => mbodyTopMargin = 0"
                                />
                                
                            </div>
                        </div>
                    </div>
                    <div>
                        <!--
                        <NonceEditor
                            v-if="txNonce != null"
                            :nonce="txNonce"
                            @change="v => txNonce = v"
                        />
                        -->
                    </div>
                </div>
                <div class="px-2 py-2">
                    <button @click="handleOnSubmit" class="btn btn-primary w-full rounded-lg">
                        Confirm Swap
                    </button>
                </div>
            </div>
        </template>

    </Modal>
</template>