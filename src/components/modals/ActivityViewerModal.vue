<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import Modal from './Modal.vue'; 
import { useNetworks } from "../../composables/useNetworks"  
import { useTokens } from "../../composables/useTokens"

const props = defineProps({
    data: { type: Object, required: true }
})

const { getTokenByAddr } = useTokens()
const net = useNetworks()
const explorerUrl = ref("")
const dataToRender = ref()
let dataToCopy = {}

onBeforeMount(async () => {

    let _d = props.data
    let rawTxInfo = _d.extraInfo.rawTxInfo;
    let _r = {}

    _r["type"] = _d.activityType;

    let explorer = await net.getExplorer(_d.chainId)
    explorerUrl.value = explorer

    //console.log("explorer===>", explorer)

    if(['token_transfer', 'nft_transfer'].includes(_d.activityType)){

        let from = _d.extraInfo.sender; 
        let to   = _d.extraInfo.recipient;

        let tokenInfo = await getTokenByAddr(_d.contract)

        //console.log("tokenInfo===>", tokenInfo)

        let fromHref = (explorer == '') 
                ? from
                : `<a href="${explorer}/address/${from}" target='_blank'>${from}</a>`

        let tokenNameAndSymbol = `
                            <div class='d-flex py-0 my-0'>
                                <img src='${tokenInfo.image}' alt='' class='icon icon-sm' />
                                <div class='d-flex'>
                                    <div class='mx-1'>${tokenInfo.name}</div>
                                    <div class='fw-semibold fst-italic'>${tokenInfo.symbol}</div>
                                </div>
                            </div>
                        `
        if(explorer != '')  {
            tokenNameAndSymbol =    `<a href="${explorer}/address/${_d.contract}" 
                                        target='_blank'
                                        class='py-0 my-0'
                                    >
                                        ${tokenNameAndSymbol}
                                    </a>`
        }
                    
        _r['asset'] = tokenNameAndSymbol

        dataToCopy["asset"] = _d.contract

        _r['from'] = fromHref

        let toHref = (explorer == '') 
                ? to
                : `<a href="${explorer}/address/${to}" target='_blank'>${to}</a>`


        _r["to"] = toHref 

        _r["value"] = `${_d.extraInfo['amountDecimal']} ${_d.extraInfo['tokenSymbol'].toUpperCase()}` 

        _r["transfer_mode"] = _d.extraInfo.transferType;

        dataToCopy["to"] = to
        dataToCopy["from"] = from
    }

    _r["date"] = Utils.formatDateMillis(_d.timestamp, 'MMM D, YYYY H:mm')

    _r["hash"] = (explorer == '')
                    ? _d.hash
                    : `<a href="${explorer}/tx/${_d.hash}" target='_blank'>${_d.hash}</a>`
    
    dataToCopy["hash"] = _d.hash

    dataToRender.value = _r
})
</script>
<template>
    <Modal
        id="activity-viewer"
        title="Activity"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
    >
        <template #body>
            <div class="p-2 py-4 px-3">
                <template v-for="(value, key) in dataToRender">
                    <div class="d-flex justify-content-between align-items-center my-3">
                        <div class="fs-11 fw-semibold hint ls-2 text-upper pe-5 text-start">
                            {{ key.replace(/_/g, " ") }}
                        </div>
                        <div class="text-capitalize fs-15  text-end ps-2">
                            <div class="text-info"
                                v-if="['from', 'to', 'hash', 'asset'].includes(key) &&  explorerUrl != ''"
                            >   
                                <div class="d-flex">
                                    <span v-if="key in dataToCopy">
                                        <CopyBtn :text="dataToCopy[key]" btnClasses="text-success" />
                                    </span>      
                                    <div v-html="value" 
                                        :class="`ms-1 ${!['asset'].includes(key) ? 'text-break': ''}`"
                                    ></div>
                                </div>
                            </div>
                            <div v-else>
                                {{ value.replace(/_/g, ' ') }}
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </template>
    </Modal>
</template>
<style>
</style>