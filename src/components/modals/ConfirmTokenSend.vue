<script setup>
import {  ref, watch } from "vue";
import Utils from "../../classes/Utils"
import { useTokens } from '../../composables/useTokens'
import Status from "../../classes/Status"
import { formatUnits, getAddress } from "ethers";
import { useWalletStore } from '../../store/walletStore'
import { computedAsync } from '@vueuse/core'
import GasFeePicker from "../common/GasFeePicker.vue"
import { useRouter } from "vue-router";

import erc20Abi from "../../data/abi/erc20.json"
import erc721Abi from "../../data/abi/erc721.json"
import erc1155Abi from "../../data/abi/erc1155.json"
import InlineError from "../common/InlineError.vue";
import { useActivity } from "../../composables/useActivity"
import { useNetworks } from "../../composables/useNetworks";

const props = defineProps({
    id: { type: String, required: true },
    recipient: { type: String, required: true },
    tokenType: { type: String, required: true },
    tokenInfo: { type: Object, required: true },
    amount: { type: String, required: true },
    amountUint: { type: null, required: true },
})


const router = useRouter()
const title = ref( `Confirm <span class='hinted'>
                        ${props.tokenInfo.symbol.toUpperCase()}
                    </span> Transfer
                `)

const initialized = ref(false)
const { getTokenByAddr, geTokenFiatValue, updateBalances } = useTokens()
const { getWeb3Conn, getActiveWalletInfo } = useWalletStore()
const activeWalletInfo = ref(null)

const activity = useActivity()
const network = useNetworks()

const feeData = ref()
const onChainGasLimit = ref(null)
const supportsEip1559Tx = ref(false)

const txGasLimit = ref(null)

const txMaxFeePerGas      = ref(null)
const txPriorityFeePerGas = ref(null)

const txTotalFeeUint     = ref(null)
const txTotalFeeDecimals = ref(null)
const gasFeeInFiat       = ref(null)


const errorMsg = ref("")
const isLoading = ref(false)
const loadingText = ref("")
const balanceInfo = ref(null)
const finalAmount = ref(null)
const finalAmountUint = ref(null)

const txNonce = ref("")
const customTxNonce = ref("")
const editNonce = ref(false)

const nativeTokenInfo = ref(null)
const nativeTokenBalanceInfo = ref(null)
const hasInsufficientNativeToken = ref(false)
const mbodyTopMargin = ref(0)

const finalAmountFiat = computedAsync( async() => (
    (finalAmount == null) 
        ? null 
        : (await geTokenFiatValue(props.tokenInfo.contract, finalAmount.value))
))

let web3Conn = null;

const onShow = (mElement, mInstance) => {
    initialize()
}

const processFeeAndFinalAmount = async () => {

    let p = props;
    let balance = balanceInfo.value.balance;

    if(txTotalFeeUint.value == null) return;

    //console.log("txTotalFeeUint.value====>", txTotalFeeUint.value)

    
    //if native token
    if(p.tokenType == 'native') {

        nativeTokenInfo.value = p.tokenInfo
        nativeTokenBalanceInfo.value = balanceInfo.value
        
                      
        if( txTotalFeeUint.value >= balance){
            return  hasInsufficientNativeToken.value = true
        }

         let amountWithFee = p.amountUint + txTotalFeeUint.value
 
        if(amountWithFee >= balance){
            finalAmountUint.value = p.amountUint - txTotalFeeUint.value
        } else {
            finalAmountUint.value = p.amountUint
        }

        if(finalAmountUint.value <= BigInt(0)) {
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

        if(nativeBalance.balance < txTotalFeeUint.value){
            //console.log("2====>")
            return hasInsufficientNativeToken.value = true
        }
    }
  
    //console.log(" finalAmount.value===>",  finalAmount.value)
    //console.log(" hasInsufficientNativeToken.value===>",  hasInsufficientNativeToken.value)
}

const initialize = async () => {
    try{

        activeWalletInfo.value = await getActiveWalletInfo()
        balanceInfo.value = props.tokenInfo.balanceInfo;

        if(initialized.value){
            await processFeeAndFinalAmount()
            return true
        }

        errorMsg.value = ""
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

        // lets get native token info
        nativeTokenInfo.value = await getTokenByAddr(Utils.nativeTokenAddr)

        //await processFeeAndFinalAmount()

    } catch(e) {

        Utils.logError("ConfirmTokenSend#initialize:", e)
        errorMsg.value = Utils.generalErrorMsg

    } finally {
        initialized.value = true 
        isLoading.value = false
    }
}

const getTxNonce = async () => {
    try {

        let resultStatus = await web3Conn.getTxNonce(activeWalletInfo.value.address)

        if(resultStatus.isError()) {
            return resultStatus
        }

        let nonce = resultStatus.getData().toString()
        txNonce.value = nonce
        customTxNonce.value = nonce

        return Status.success()
    } catch(e){
        Utils.logError("ConfirmTokenSend#getTxNonce:", e)
        return Status.errorPromise("Failed to fetch tx nonce")
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

            onChainGasLimit.value = gasEstimateStatus.getData() || BigInt(21_000)

        } 
        else if(p.tokenType == 'erc20'){

            let contract =  web3Conn.contract(p.tokenInfo.contract, erc20Abi)
            onChainGasLimit.value = await contract.transfer.estimateGas(p.recipient, p.amountUint)

        }

        txGasLimit.value = onChainGasLimit.value

        return Status.successData(txGasLimit) 
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

    supportsEip1559Tx.value = fd.supportsEip1559Tx

    feeData.value = fd

    return Status.successData(fd)
}


const fetchGasInfo = async () => {

    //lets get base fee 
   // let baseFee = await web3Conn.getBlock()

    let resulstArr = await (Promise.all([fetchFeeData(), getGasLimit(), getTxNonce() ]))

    //console.log("resulstArr===>", resulstArr)

    for(let resultStatus of resulstArr){
        if(resultStatus.isError()){
            return resultStatus
        }
    }

    return Status.success()
}

const toggleEditNonce = () => {
    editNonce.value = !editNonce.value
    if(editNonce.value) {
        editNonceInput.value.focus()
    }
}

const processTransfer = async () => {
    
    let loader; 

    try {

        let nativeToken = nativeTokenInfo.value
        let p = props;

        if(hasInsufficientNativeToken.value){
            return Utils.mAlert(`Insufficient ${nativeToken.symbol.toUpperCase()} for gas fee`)
        }

        let userNonce = customTxNonce.value.toString().trim()

        let resultStatus;
        let nonce = (userNonce != "" && /\d+/gi.test(userNonce))
                        ? userNonce
                        : txNonce.value

        let maxFeePerGas = txMaxFeePerGas.value
        let maxPriorityFeePerGas = txPriorityFeePerGas.value

        let contractAddr = p.tokenInfo.contract

        let recipient = getAddress(p.recipient)
        let sender = getAddress(activeWalletInfo.value.address)

        loader = Utils.loader("Processing Transfer..")

        if(p.tokenType == 'native'){

            let txParams = { 
                to: recipient, 
                value: finalAmountUint.value, 
                nonce, 
                gasLimit: txGasLimit.value
            }

            if(supportsEip1559Tx.value){
                txParams = {...txParams, maxFeePerGas, maxPriorityFeePerGas}
            } else {
                txParams["gasPrice"] = maxFeePerGas
            }

            resultStatus = await web3Conn.sendETH(txParams, 1)

        } else {
            
            let minConfirmaions = 1

            let contract, method, params; 

            if(p.tokenType == 'erc20'){
                contract =  web3Conn.contract(contractAddr, erc20Abi)
                method = "transfer"
                params = [recipient, p.amountUint]
            } 

            // erc 721 
            else if (p.tokenType == 'erc721'){
                contract =  web3Conn.contract(contractAddr, erc721Abi)
                method = "safeTransferFrom"
                params = [sender, recipient, p.tokenInfo.tokenId]
            }

            // erc 1155 
            else if (p.tokenType == 'erc1155'){
                contract =  web3Conn.contract(contractAddr, erc1155Abi)
                method = "safeTransferFrom"
                params = [sender, recipient, p.tokenInfo.tokenId, p.amountUint, '']
            }

            let ethersTxOpt = { 
                nonce, 
                gasLimit: txGasLimit.value
            }

            if(supportsEip1559Tx.value){
                ethersTxOpt = {...ethersTxOpt, maxFeePerGas, maxPriorityFeePerGas}
            } else {
                ethersTxOpt["gasPrice"] = maxFeePerGas
            }


            // (method, params = [], minConfirmations = 1, ethersOpts={})
            //lets send Tx 
            resultStatus = await contract.sendTx(method, params, minConfirmaions, ethersTxOpt)
        } //en if contract

        //console.log("resultStatus ==> ", resultStatus)

        if(resultStatus.isError()){
            return Utils.mAlert(resultStatus.getMessage())
        }

        //lets save the tx 
        let rawTxInfo = resultStatus.getData()

        let tokenSymbol = p.tokenInfo.symbol

        let extraInfo = {
            rawTxInfo, 
            sender,
            recipient,
            token:          contractAddr,
            amount:         p.amountUint,
            amountDecimal:  p.amount,
            transferType:   "send",
            tokenSymbol
        }
        
        //let blockInfo = await web3Conn.getBlock(rawTxInfo.blockNumber)

        await activity.saveActivity({
            title:          `sent_{tokenSymbol}`,
            titleParams:    { tokenSymbol },
            wallet:         sender, 
            chainId:        web3Conn.chainId,
            activityType:   "token_transfer",
            contract:       contractAddr,
            hash:           rawTxInfo.hash, 
            txDate:        (rawTxInfo.timestamp || null),
            extraInfo          
        })

        updateBalances(null, true)

        let explorerUrl = await network.getExplorer(web3Conn.chainId, `tx/${rawTxInfo.hash}`)
        
        await Utils.txAlert({
            text: `${p.tokenInfo.symbol.toUpperCase()} transfer successful`,
            icon: "tx_success.svg",
            explorerUrl
        })

        router.push(`/tokens/${contractAddr}`)
        
    } catch(e){
        Utils.logError("ConfirmTokenSend#handleSend:", e)
        Utils.mAlert(Utils.generalErrorMsg)
    } finally {
        if(loader) loader.close()
    }
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
    
    //console.log("data===>", data)
    txGasLimit.value         = gasLimit
    txMaxFeePerGas.value     = maxFeePerGas 
    txTotalFeeUint.value     = totalFee
    txTotalFeeDecimals.value = totalFeeDecimals
    txPriorityFeePerGas.value = maxPriorityFeePerGas

    processFeeAndFinalAmount()
}

const handleOnRetry = () => {
    errorMsg.value = ""
    initialized.value = false 
    initialize()
}
</script>

<template>
    <Modal
        :id="props.id"
        :title="title"
        :has-header="!isLoading"
        :has-footer="false"
        @show="onShow"
    >
        <template #body>
            <div id="gasfee-picker-container"></div>
            <div :class="`p-2 confirm-tx-modal mt-${mbodyTopMargin}`">
                <LoadingView :isLoading="isLoading" :loadingText="loadingText">
                    <div v-if="errorMsg != ''">
                        <InlineError
                            :text="errorMsg"
                            @retry="handleOnRetry"
                        />
                    </div>
                    <div v-else>
                        
                        

                        <div class="p-2 center-vh text-center my-2">
                            <div>
                                <div class="fw-medium fs-3 text-truncate">
                                    -{{ finalAmount }} {{ props.tokenInfo.symbol }}
                                </div>
                                <div v-if="finalAmountFiat != null && finalAmountFiat['value'] != null" 
                                    class="fs-12 hint fw-semibold text-upper mt-1"
                                >
                                    ~{{ finalAmountFiat["value"] }} {{ finalAmountFiat.symbol.toUpperCase() }}
                                </div>
                            </div>
                        </div>

                        <div class="m-2 details rounded-lg py-3 px-4">
                            <div class="d-flex  justify-content-between my-3">
                                <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                                    Asset
                                </div>
                                <div class="d-flex fs-14 ps-3 fw-middle text-end">
                                    <div class="pe-1">
                                        {{ tokenInfo.name }}
                                    </div>
                                    <div class="hint text-upper">
                                        {{ tokenInfo.symbol }}
                                    </div>
                                </div>
                            </div>
                            <div v-if="activeWalletInfo != null" 
                                class="d-flex  justify-content-between my-3"
                            >
                                <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                                    From
                                </div>
                                <div class="d-flex ps-3 fw-middle">
                                    <CopyBtn :text="activeWalletInfo.address" 
                                        successText="Sender copied" 
                                        btnClasses="text-warning me-1" 
                                    />
                                    <div class="fs-14 text-break text-end">
                                        {{ Utils.maskAddress(activeWalletInfo.address) }} - 
                                        <span class='text-success'>{{ activeWalletInfo.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex  justify-content-between my-3">
                                <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                                    To
                                </div>
                                <div class="d-flex ps-3 fw-middle">
                                    <CopyBtn :text="recipient" 
                                        successText="Recipient copied" 
                                        btnClasses="text-warning " 
                                    />
                                    <div class="fs-14 text-break text-end">
                                        {{ recipient }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="m-2 details rounded-lg py-3 px-4">
                            <div v-if="nativeTokenInfo != null" 
                                class="d-flex  justify-content-between align-items-center my-3"
                            >
                                <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                                    Network Fee
                                </div>
                                <div class="d-flex ps-3 fw-middle">
                                    <div class="fs-14 flex-wrap text-end center-vh text-break">
                                        <div style="max-width: 180px;">
                                            {{  Utils.formatCrypto(txTotalFeeDecimals) }} {{ nativeTokenInfo.symbol.toUpperCase() }}
                                        </div>
                                        <div v-if="gasFeeInFiat != null">
                                            ({{ Utils.formatFiat(gasFeeInFiat.value) }} {{ gasFeeInFiat.symbol.toUpperCase() }})
                                        </div>
                                        <GasFeePicker
                                            :nativeTokenInfo="nativeTokenInfo"
                                            :feeData="feeData"
                                            :gasLimit="txGasLimit"
                                            :onChainGasLimit="onChainGasLimit"
                                            :popoverOpts="{ placement: 'left'}"
                                            selected="market"
                                            placement="left"
                                            container="#gasfee-picker-container"
                                            @change="onGasPriceChange"
                                            @show="() => mbodyTopMargin = 3"
                                            @hide="() => mbodyTopMargin = 0"
                                        />
                                       
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex align-items-center justify-content-between my-3">
                                <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                                    Nonce
                                </div>
                                <div class="ps-3 center-vh fw-middle" :key="editNonce">
                                    <NonceEditor
                                        v-if="customTxNonce != null"
                                        :nonce="customTxNonce"
                                        @change="v => customTxNonce = v"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class='mx-3 mt-4 mb-3'>
                            <button @click.prevent="processTransfer"
                                class="btn btn-lg btn-success w-full rounded-pill"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </LoadingView>
            </div>
        </template>
    </Modal>

</template>
