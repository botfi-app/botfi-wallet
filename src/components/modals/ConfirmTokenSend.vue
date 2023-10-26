<script setup>
import { onMounted, ref } from "vue";
import Utils from "../../classes/Utils"
import { useTokens } from '../../composables/useTokens'
import { useNetworks } from '../../composables/useNetworks';
import EthUriParser from "../../classes/EthUriParser"
import Status from "../../classes/Status"
import { useSettings } from '../../composables/useSettings'
import { Contract } from "ethers";

const props = defineProps({
    id: { type: String, required: true },
    title: { type: String, default: "Confirm Action" },
    recipient: { type: String, required: true },
    tokenType: { type: String, required: true },
    tokenInfo: { type: Object, required: true },
    amount: { type: String, required: true },
})

const erc20TransferAbi = ["function transfer(address to, uint amount)"]

const initialized = ref(false)
const { getWeb3Conn } = useNetworks()
const feeData = ref()
const errorMsg = ref("")
const isLoading = ref(false)

let web3Conn = null;

const onShow = (mElement, mInstance) => {
    console.log(props.tokenInfo)
    initialize()
}

const initialize = async () => {
    try{

        if(initialized) return false

        isLoading.value = true 

        let web3ConnStatus = await getWeb3Conn()

        if(web3ConnStatus.isError()){
            return errorMsg.value = web3ConnStatus.getMessage()
        }

        web3Conn = web3ConnStatus.getData() 

    } catch(e) {

        Utils.logError("ConfirmTokenSend#initialize:", e)
        errorMsg.value = Utils.generalErrorMsg

    } finally {

        initialize.value = true 
        isLoading.value = false

    }
}

//0xa01641dF0bFEFb42cb739B550Fd0B4C477983201
const getGasLimit = async () => {
 
    let p = props;
    let data;

    if(tokenType == 'native') {
        data = null
    } 
    else if(tokenType == 'erc20'){
        let contract = new Contract(p.tokenInfo.contract, erc20TransferAbi)
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
    let resultArr = Promise.all([fetchFeeData(), ])
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


        </template>
    </Modal>

</template>