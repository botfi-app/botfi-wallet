<script setup>
import { nextTick, ref, watch } from 'vue';
import { Modal as bsModal } from 'bootstrap';
import { usePermission } from "../../composables/usePermission"
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import { useNetworks } from '../../composables/useNetworks';
import { useTx } from '../../composables/useTx';
import { useTokens } from '../../composables/useTokens';
import { Wallet, formatUnits, getUint, getBigInt, parseUnits, formatEther, isHexString } from "ethers"
import RenderEthSignTyedData from '../common/RenderEthSignTyedData.vue';


const tokensCore = useTokens()
const txCore = useTx()
const walletStore = useWalletStore()
const netCore = useNetworks()
const { isNetReady, activeNetwork } = netCore

const isLoading = ref(false)
const id = ref("permission_modal")
const title = ref("")
const text  = ref("")
const warningText = ref("")
const extraParams = ref([])
const method = ref(null)
const origin = ref("")

const activeWalletAddr = ref("")
const nativeTokenInfo = ref({})

const emits = defineEmits(["show", "hide"])

const errorMsg = ref("")
const isOpened = ref(null)
const isConfirmed = ref(false)
const isReady = ref(false)
const confirmBtn = ref("")
const requestParams = ref()

const decodedContractInfo = ref([])
//const parsedTxData = ref(null)

const hasTxValue = ref(false)
const txValue = ref(null)
const txValueBN = ref(BigInt("0"))
const txValueText = ref("")


let web3Conn = null;

const isTx = ref(false)

const  hasInsufficientNativeToken = ref(false)
const  extraRequiredBalance = ref(BigInt("0"))
const  extraRequiredBalanceText = ref("")

const defaultGasLimit = ref(null)
const gasPriceFromOrigin = ref(null)
const txGasLimit = ref(null)

const txMaxFeePerGas = ref(null)
const txPriorityFeePerGas = ref(null)
const txTotalFeeUint = ref(null)
const txTotalFeeDecimals = ref(null)

const totalTxValueBN = ref(null)
const totalTxValueText = ref(null)

const feeData = ref(null) 


const isTxValueNull = (val) => ["0x0", "0x", null, undefined].includes(val)

const initialize = async () => {

    try {

        //console.log("requestParams.value===>", requestParams.value)

        hasInsufficientNativeToken.value = false

        extraRequiredBalance.value = BigInt("0")
        extraRequiredBalanceText.value = ""

        isLoading.value = true

        isReady.value = false

        errorMsg.value = ""

        web3Conn = null 

        isTx.value = false

        decodedContractInfo.value = []

        hasTxValue.value = false 
        txValueBN.value = BigInt("0") 
        txValueText.value = ""

        activeWalletAddr.value = (await walletStore.getActiveWalletInfo()).address;

        let _mthd = method.value
        let _rp =  requestParams.value

        //console.log("_mthd=====>", _mthd)
        //console.log("_rp===>", _rp)

        if(["eth_sendTransaction"].includes(_mthd)){

            isTx.value = true
            
            // lets get user native balance 
            let nToken = await tokensCore.getNativeToken()
            nativeTokenInfo.value = nToken;

            //console.log("nativeTokenInfo.value===>", nativeTokenInfo.value)

            let web3ConnStatus = await walletStore.getWeb3Conn()

            if(web3ConnStatus.isError()){
                return errorMsg.value = web3ConnStatus.getMessage()
            }

            web3Conn = web3ConnStatus.getData()

            let requestParamsObj = _rp[0] ||  null

            //lets fetch the tx data 
            if(requestParamsObj == null){
                return errorMsg.value = "Transaction parameters required"
            }

            await processGasInfo(requestParamsObj)

            txValue.value = requestParamsObj.value || null 

            //console.log("txDataObj==>", txDataObj)

            let _txValueText = "0"

            if(!isTxValueNull(txValue.value)){
                hasTxValue.value = true
                txValueBN.value =  getUint(txValue.value)
                _txValueText = Utils.formatCrypto(formatUnits(txValue.value, nToken.decimals)) 
            }

            txValueText.value = `${_txValueText} ${nToken.symbol.toUpperCase()}`

            //console.log("hasTxValue.value===>", hasTxValue.value)

            let _data = await txCore.decodeTxData(requestParamsObj)

            if(_data == null) return;

            let infoText = _data.infoText || ""
            let warning = _data.warningText || ""

            let website = (new URL(origin.value)).hostname

            if(infoText != "") {
                infoText = infoText.replace("{{WEBSITE}}", `<strong>${website}</strong>`)
                text.value = infoText
            }

            if(warning != "") warningText.value = warning

            let tokenInfo = _data.tokenInfo || null

    
            let methodInfoArr = [{
                name: "contract",
                value: requestParamsObj.to
            }]

            if(tokenInfo != null){
                methodInfoArr.push({
                    name: "Token", 
                    value: `${tokenInfo.name} (${tokenInfo.symbol.toUpperCase()})`
                })
            }

            methodInfoArr.push({
                name:  "Method",
                value: _data.methodName
            })

            let methodArgs = _data.methodArgs || []

            methodArgs.forEach(item => {

                let argValueStr = item.argValue.toString()

                if("argValueFormatted" in item){
                    argValueStr = item.argValueFormatted
                }

                methodInfoArr.push({
                    name:  item.argName, 
                    value: argValueStr
                })
            })

      
            decodedContractInfo.value = methodInfoArr
        } //end if eth_sendTransaction

        else if(_mthd == "eth_signTypedData_v4"){

            let requiredAddr = _rp[0] || ""

            if(requiredAddr.toLowerCase() != activeWalletAddr.value.toLowerCase()){
                return errorMsg.value = "The required wallet address does not match the active wallet"
            }

            let sigInfo = _rp[1] || "{}"
            
            if(typeof sigInfo == 'string'){
                try { sigInfo = JSON.parse(sigInfo) } catch(e) { sigInfo = {} }
            }

            let domainInfo = sigInfo["domain"] || {}

            //console.log("sigInfo============>", typeof sigInfo)
            console.log("domainInfo============>", domainInfo)

            let requiredChainId = domainInfo.chainId || ""
            let curChainId = activeNetwork.value.chainId

            if(requiredChainId == "" || requiredChainId != curChainId){
                return errorMsg.value = "The required network does not match the connected network" 
            }   

        } else if(["personal_sign","eth_decrypt"].includes(_mthd)){

            let requiredAddr = _rp[1] || ""
            let data = _rp[0] || ""

            if(_mthd == "personal_sign" && !data.startsWith("0x")){
                return errorMsg.value = "Parameter #2 requires a valid hex value"
            }

            if(requiredAddr.toLowerCase() != activeWalletAddr.value.toLowerCase()){
                return errorMsg.value = `unknown wallet address: '${requiredAddr}'`
            }
        } 
        else if(_mthd == "eth_getEncryptionPublicKey") {

            let requiredAddr = _rp[0] || ""

            if(requiredAddr.toLowerCase() != activeWalletAddr.value.toLowerCase()){
                return errorMsg.value = `unknown wallet address: '${requiredAddr}'`
            }
        }

    } catch(e){
        Utils.logError("PermissionModal#initialize:", e)
        errorMsg.value = e.message;
    } finally {
        isLoading.value = false
        isReady.value = true
    }
}

const processGasInfo = async (txDataObj) => {

    //console.log("txDataObj===>", txDataObj)
    
    //let nToken = nativeTokenInfo.value

    let fdStatus = await web3Conn.getFeeData()

    if(fdStatus.isError()){
        return errorMsg.value = fdStatus.getMessage()
    }
 
    let fd = fdStatus.getData()

    let _siteGasPrice = txDataObj.gasPrice || null
    let gasLimit = txDataObj.gas || null
    
    if(!isTxValueNull(_siteGasPrice)){
        gasPriceFromOrigin.value = getBigInt(_siteGasPrice)
    }

    if(isTxValueNull(gasLimit)){

        let estimateStatus = await web3Conn.getETHGasEstimate(txDataObj)

        if(estimateStatus.isError()){
            return errorMsg.value = estimateStatus.getMessage()
        }

        gasLimit = estimateStatus.getData()
    }

    feeData.value  = fd
    txGasLimit.value = getBigInt(gasLimit)
    defaultGasLimit.value = txGasLimit.value

    //txMaxFeePerGas.value = fd.maxFeePerGas
    //txPriorityFeePerGas.value = fd.maxPriorityFeePerGas

    //txTotalFeeUint.value = 

    //processFeeAndFinalAmount()
}


const  show = async (opts={}) => {


    title.value           = opts.title || "";
    text.value            = opts.text || "";
    extraParams.value     = opts.extraParams || [];
    warningText.value     = opts.warningText || "";
    method.value          = opts.method || ""
    requestParams.value   = opts.requestParams || []  
    origin.value          = opts.origin || ""    
    confirmBtn.value      = opts.confrimBtn || "Confirm"

   
    bsModal.getInstance("#"+id.value).show()

    await initialize()

    return (new Promise((resolve, reject) => {
        let intval = setInterval(() => {
            if(isOpened.value != null && isOpened.value == false){
                
                resolve({
                    isConfirmed: isConfirmed.value,
                    isRejected: !isConfirmed.value,
                    requestParams:   requestParams.value
                });

                clearInterval(intval)
            }
        },100)
    }))
}

const  hide = () => {
    nextTick(() =>{
        bsModal.getInstance("#"+id.value).hide()
    })
}


defineExpose({show, hide})

const onShow = () => {
    
    isOpened.value = true 
    
    //confirm btns 
    isConfirmed.value = false

    emits('show')
}

const onHide = () => {
    isOpened.value = false 
    isReady.value  = false
    method.value   = ""

    emits('hide')
}

const handleApproveBtn = async () => {
    isConfirmed.value = true 

    hide()
}

const handleRejectBtn = () => {
    isConfirmed.value = false 
    hide()
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

    let nTokenSymbol = nativeTokenInfo.value.symbol.toUpperCase()

    txGasLimit.value          = gasLimit
    txMaxFeePerGas.value      = maxFeePerGas 
    txTotalFeeUint.value      = totalFee
    txTotalFeeDecimals.value  = Utils.formatCrypto(totalFeeDecimals) +" "+ nTokenSymbol
    txPriorityFeePerGas.value = maxPriorityFeePerGas

    let tp = requestParams.value[0]
    let fd = feeData.value

    if(fd.supportsEip1559Tx){
        tp.maxFeePerGas = maxFeePerGas
        tp.maxPriorityFeePerGas = maxPriorityFeePerGas
    } else {
        tp.gasPrice = maxFeePerGas
    }

    tp.gas = gasLimit

    processFeeAndFinalAmount()
}

const processFeeAndFinalAmount = () => {

    let nToken = nativeTokenInfo.value 
    let nBalance = nToken.balanceInfo.balance 
    let nSymbol = nToken.symbol.toUpperCase()
    //console.log("nBalance===>", nBalance)
             
    totalTxValueBN.value = txTotalFeeUint.value + txValueBN.value
    totalTxValueText.value = formatEther(totalTxValueBN.value) + " " + nSymbol

    if(totalTxValueBN.value > nBalance){
        extraRequiredBalance.value = (totalTxValueBN.value - nBalance)
        extraRequiredBalanceText.value = formatEther(extraRequiredBalance.value) + " " + nSymbol
        return  hasInsufficientNativeToken.value = true
    } 
}   
</script>
<template>
    <Modal
        :id="id"
        title=""
        :has-header="false"
        :has-footer="true"
        dialogClass="modal-lg modal-dialog-scrollable modal-dialog-centered  perm-modal"
        :modalOpts="{ backdrop: 'static', keyboard: false }"
        @show="onShow"
        @hide="onHide"
    >   
        <template #body>
            <div id="gasfee-picker-container"></div>
            <div class="py-4 px-3 text-center">
                <LoadingView :isLoading="isLoading" loadingText="Loading..">

                    <div class="center-vh">
                        <Icon 
                            name="mynaui:info-hexagon" 
                            class="text-success" 
                            :size="60"
                        />
                    </div>

                    <div class="my-2  my-3" v-if="title != ''">
                        <h2> {{ title }}</h2>
                        <div class="fs-12 muted">{{ origin }}</div>
                    </div>

                    <div v-if="hasTxValue" class="text-center text-primary">
                        <h2 class="text-break">-{{ txValueText }}</h2>
                    </div>

                    <div v-if="text != ''" 
                        class="my-2 mt-4"
                        v-html="text"
                    />

                    <p v-if="errorMsg != ''" class='p-2 text-danger text-start'>
                        <div class="fw-semibold">Error:</div>
                        {{  errorMsg }}
                    </p>

                    <div v-else>

                        <template v-if="warningText != ''">
                            <div class="d-flex text-start mt-4">
                                <div><Icon name="typcn:warning-outline" class="text-danger" :size="24"  /></div>
                                <div class="fs-12 ms-2 text-danger" v-html="warningText"></div>
                            </div>
                        </template>

                        <div  v-if="hasTxValue" class="d-flex text-start my-2">
                            <div><Icon name="typcn:warning-outline" class="text-warning" :size="24"  /></div>
                            <div class="fs-12 ms-2 text-warning text-break">
                                This transaction will transfer/withdraw {{ txValueText }} from your wallet
                            </div>
                        </div>

                        <div class="my-3" v-if="isNetReady">
                            <div class="fs-12 fw-bold muted text-start mb-1">Network</div>
                            <div class="net-select-btn p-3 text-start rounded-lg">
                                <div class="d-flex align-items-center">
                                    <Image 
                                        :width="24" 
                                        :height="24" 
                                        class="rounded-circle shadow"
                                        :src="activeNetwork.icon || ''" 
                                        :placeholder="activeNetwork.chainName"
                                    />
                                    <div class="ps-2 fw-semibold">
                                        {{ activeNetwork.chainName }}
                                    </div>
                                </div>
                                <div class="fs-12 muted">
                                    {{ Utils.maskAddress(activeWalletAddr, 8, 12) }}
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="isTx">
                            <template v-if="decodedContractInfo.length > 0">
                                <div>
                                    <div class="fs-12 fw-bold muted text-start mb-1 mt-4">
                                        Contract Info
                                    </div>
                                    <div class="px-3 py-2 bg-darken-5 rounded-lg">
                                        <template v-for="item in decodedContractInfo">
                                            <div class="space-between my-3 fs-12 fw-medium">
                                                <div class="text-capitalize pe-4 no-break">
                                                    {{ item.name }}:
                                                </div>
                                                <div class="text-end d-flex  text-break">
                                                    <div class="" v-if="Utils.isAddress(item.value)">
                                                        <CopyBtn :text="item.value" btnClasses="text-warning" />
                                                    </div>
                                                    <div>{{ item.value }}</div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div> 
                            </template>
                        </div>
                        <div v-else-if="['eth_signTypedData_v4'].includes(method)">
                    
                            <RenderEthSignTyedData 
                                :params="requestParams"
                            />
                        </div>

                        <div class="text-start" 
                            v-else-if="['personal_sign','eth_decrypt'].includes(method)"
                        >
                            <div class="fs-12 fw-semibold my-2">Message</div>
                            <p class="fs-14 text-break">{{ requestParams[0] || "" }}</p>
                        </div>
                    </div>
                </LoadingView>
            </div>
        </template>
        <template #footer>
            <div v-if="isTx && isReady" class="summary fs-12 fw-medium text-break w-100 mt-2">
                <div class="space-between py-1 w-100">
                    <div class="me-3 text-start">Amount: </div>
                    <div class="text-end">{{ txValueText }}</div>
                </div>
                <div class="space-between py-1 w-100">
                    <div class="me-3 text-start">Network Fee: </div>
                    <div class="d-flex text-end align-items-center">
                        <div class="">{{ txTotalFeeDecimals }}</div>
                        <GasFeePicker
                            :nativeTokenInfo="nativeTokenInfo"
                            :feeData="feeData"
                            :gasLimit="txGasLimit"
                            :onChainGasLimit="defaultGasLimit"
                            :gasPriceFromWebsite="gasPriceFromOrigin"
                            :popoverOpts="{ placement: 'left'}"
                            :selected="(gasPriceFromOrigin != null) ? 'website' : 'market'"
                            placement="left"
                            container="#gasfee-picker-container"
                            @change="onGasPriceChange"
                            @show="() => mbodyTopMargin = 3"
                            @hide="() => mbodyTopMargin = 0"
                        />
                    </div>
                </div>
                <div class="space-between w-100 py-1">
                    <div class="me-3 text-start">Amount + Network Fee: </div>
                    <div class="text-end">{{ totalTxValueText }}</div>
                </div>

                <div class="fs-12 text-danger my-1" v-if="hasInsufficientNativeToken">
                    Not enough balance, you need to topup 
                    {{ extraRequiredBalanceText }} to complete the transaction
                </div>
            </div>
            <div class="mt-3 center-vh w-full">
                <button class="btn btn-danger p-3 w-full rounded-lg me-2"
                    @click.prevent="handleRejectBtn"
                >
                    Cancel
                </button>
                <button v-if="errorMsg == '' && !isLoading && isReady && !hasInsufficientNativeToken"
                    class="btn btn-success p-3 w-full rounded-lg"
                    @click.prevent="handleApproveBtn"
                >
                    {{ confirmBtn }}
                </button>
                
            </div>
            
        </template>
    </Modal>
</template>
<style lang="scss">
    .perm-modal {
        width: 100% !important;
        margin: 10px 0px; 
        padding: 0px;
        .modal-content { margin: 0px !important; padding: 0px !important; }
    }
</style>