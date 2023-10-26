<script setup>
import { onMounted, ref, toRaw, toValue } from "vue";
import Utils from "../../classes/Utils"
import { useTokens } from '../../composables/useTokens'
import { useNetworks } from '../../composables/useNetworks';
import EthUriParser from "../../classes/EthUriParser"
import Status from "../../classes/Status"
import { useSettings } from '../../composables/useSettings'
import { Contract } from "ethers";
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
//const { getWeb3Conn } = useNetworks()
const { getWeb3 } = useWalletStore()
const feeData = ref()
const errorMsg = ref("")
const isLoading = ref(false)

let web3Conn = null;

const onShow = (mElement, mInstance) => {
    initialize()
}

const initialize = async () => {
    try{

        if(initialized.value) return false

        isLoading.value = true 

        let web3ConnStatus = await getWeb3()

        if(web3ConnStatus.isError()){
            return errorMsg.value = web3ConnStatus.getMessage()
        }

        web3Conn = web3ConnStatus.getData()

        let gasInfoStatus = await getGasLimit()

    } catch(e) {

        Utils.logError("ConfirmTokenSend#initialize:", e)
        errorMsg.value = Utils.generalErrorMsg

    } finally {

        initialize.value = true 
        isLoading.value = false

    }
}


const getGasLimit = async () => {
 
    let p = props;
    let data;

    console.log("p===>", p)

    if(p.tokenType == 'native') {
        data = null
    } 
    else if(p.tokenType == 'erc20'){

        let contract =  web3Conn.contract(p.tokenInfo.contract, erc20Abi)
        let gasLimit = await contract.transfer.estimateGas(p.recipient, p.amountUint)
        console.log("contract===>", gasLimit)
    }
}

const fetchFeeData = async () => {

    let resultStatus = await web3Conn.getFeeData()

    if(resultStatus.isError()) {
        return resultStatus
    }

    let resultData = resultStatus.getData()

    //console.log("resultData===>", resultData)

    feeData.value = resultData

    return resultStatus
}

const fetchGasInfo = async () => {
    //let resultArr = Promise.all([fetchFeeData(), getGasLimit() ])

    getGasLimit()
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
                sdsd
                {{  errorMsg }}
            </div>
        </template>
    </Modal>

</template>