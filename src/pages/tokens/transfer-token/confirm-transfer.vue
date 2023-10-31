<route>
    { 
      name: "send-token", 
      path: "/tokens/item/:contract(0x[a-fA-F0-9]{40})/transfer/confirm" 
    }
</route>
<script setup>
import { onBeforeMount, ref, inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTokens } from '../../../composables/useTokens'
import Utils from "../../../classes/Utils"

const isPageLoading = ref(false)
const route = useRoute()
const initialized  = ref(false)
const tokenAddress = ref(null)
const tokenInfo    = ref(null)
const tokenType    = ref(null)
const balanceInfo  = ref(null)
const tokenPrice   = ref(null) 
const { getTokenByAddr, updateBalances, geTokenFiatValue } = useTokens()
const pageError = ref("")
const botUtils = inject("botUtils")


const recipient = ref("")
const amount = ref("")
const amountBigInt = ref(null)
const amountFiat = ref(null)


onBeforeMount(async () => {
  initialize()
})


const initialize = async () => {

    try {

        isLoading.value = true

        await updateBalances(null, true) 

        tokenAddress.value = route.params.contract; 

        tokenInfo.value = await getTokenByAddr(tokenAddress.value)

        tokenType.value = (tokenInfo.value.contract == Utils.nativeTokenAddr)
                            ? "native"
                            : "erc20"

        if(tokenInfo.value == null){
            return pageError.value = "Unknown token, import it first"
        }

        balanceInfo.value = tokenInfo.value.balanceInfo


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

        initialized.value = true

    } catch(e){

        Utils.logError("confirm-transfer#initialize:",e)
        pageError.value = Utils.generalErrorMsg

    } finally {
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

            onChainGasLimit.value = gasEstimateStatus.getData() || 21_000n

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

    let resulstArr = await (Promise.all([fetchFeeData(), getGasLimit(), getTxNonce() ]))

    //console.log("resulstArr===>", resulstArr)

    for(let resultStatus of resulstArr){
        if(resultStatus.isError()){
            return resultStatus
        }
    }

    //console.log("feeData.value===>", feeData.value)

    let gasPrice = feeData.value.maxFeePerGas
    
    // default selected 
    selectedFeeDataName.value = "maxFeePerGas"

    // lets set the gas price here
    onChainGasPrice.value = gasPrice
    txGasPrice.value = gasPrice

    return Status.success()
}

const toggleEditNonce = () => {
    editNonce.value = !editNonce.value
    if(editNonce.value) {
        editNonceInput.value.focus()
    }
}

const handleSend = async () => {
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

        if(p.tokenType == 'native'){

            let txParams = { 
                to: recipient, 
                value: p.amountUint, 
                nonce, 
                gasPrice: txGasPrice.value, 
                gasLimit: txGasLimit.value
            }

            resultStatus = web3Conn.sendETH(txParams)

        } else {

            let contractAddr = p.tokenInfo.contract
            let recipient = getAddress(p.recipient)
            let sender = getAddress(activeWalletInfo.value.address)
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
                gasPrice: txGasPrice.value, 
                gasLimit: txGasLimit.value
            }

            // (method, params = [], minConfirmations = 1, ethersOpts={})
            //lets send Tx 
            resultStatus = await contract.sendTx(method, params, minConfirmaions, ethersTxOpt)
        } //en if contract

        console.log("resultStatus ==> ", resultStatus)
    } catch(e){
        Utils.logError("ConfirmTokenSend#handleSend:", e)
        Utils.mAlert(Utils.generalErrorMsg)
    }
}

const  onGasPriceChange = ({ name, value, gasLimit }) => {
    txGasPrice.value = value 
    selectedFeeDataName.value = name
    txGasLimit.value = gasLimit
}

</script>
<template>
    <WalletLayout
      title="Confirm Transfer"
      :showNav="false"
      :hasNetSelect="false"
      :hasAddrSelect="false"
      :pageError="pageError"
      :isLoading="isPageLoading"
    >   
        <div v-if="initialized && tokenInfo != null">
            <div class="p-2 center-vh text-center">
                <div>
                    <div class="fw-medium fs-3 text-truncate">
                        -{{ finalAmount }} {{ tokenInfo.symbol }}
                    </div>
                    <div v-if="finalAmountFiat != null && finalAmountFiat.value != null" 
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
                    class="d-flex  justify-content-between my-3"
                >
                    <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                        Network Fee
                    </div>
                    <div class="d-flex ps-3 fw-middle">
                        <div class="fs-14 flex-wrap text-end center-vh">
                            <div>{{ gasFeeInETH }} {{ nativeTokenInfo.symbol.toUpperCase() }}</div>
                            <div v-if="gasFeeInFiat != null">
                                ({{ gasFeeInFiat.value }} {{ gasFeeInFiat.symbol.toUpperCase() }})
                            </div>
                            <GasFeePicker
                                :nativeTokenInfo="nativeTokenInfo"
                                :feeData="feeData"
                                :gasLimit="txGasLimit"
                                :popoverOpts="{ placement: 'right'}"
                                :selectedFee="selectedFeeDataName"
                                placement="left"
                                @change="onGasPriceChange"
                            />
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-between my-3">
                    <div class="fs-11 hint fw-semibold text-upper  text-start pe-3">
                        Nonce
                    </div>
                    <div class="ps-3 center-vh fw-middle" :key="editNonce">
                        <input 
                            type='text' 
                            v-model="customTxNonce"
                            v-integer 
                            class="form-control form-control-sm nonce rounded-pill"
                            :disabled="!editNonce"
                            ref="editNonceInput"
                        />
                        <button
                            class="btn btn-danger p-0 rounded-circle ms-1 w-25px h-25px center-vh"
                            @click.prevent="toggleEditNonce"
                            type="button" 
                        >
                            <Icon v-if="!editNonce" name="mdi:gear" :size="16" />
                            <Icon v-else name="ic:baseline-close" :size="16" />
                        </button>
                        
                    </div>
                </div>
            </div>
            <div class='mx-3 mt-4 mb-3'>
                <button @click.prevent="handleSend"
                    class="btn btn-success w-full rounded-pill"
                >
                    Send
                </button>
            </div>
        </div>
    </WalletLayout>
</template>