<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import { Popover as bsPopover } from 'bootstrap'
import { formatUnits } from "ethers";
import Utils from "../../classes/Utils"

const props = defineProps({
    nativeTokenInfo: { type: Object, required: true },
    feeData: { type: Object, required: true },
    popoverOpts: { type: Object, required: true },
    gasLimit: { type: BigInt, required: true },
    onChainGasLimit: { type: BigInt, required: true },
    placement:   { type: String, default: 'left' },
    selectedFee: { type: String, default: 'maxFeePerGas' }
})


const feeLabelInfo = ref({
    gasPrice: { 
        name: "Low", 
        icon: "emojione:turtle", 
        duration: 60, 
        clazz: 'text-danger',
        totalFee: ''
    },
    maxFeePerGas: { 
        name: "Market", 
        icon: "emojione:horse", 
        duration: 30, 
        clazz: 'text-warning',
        totalFee: '' 
    },
    maxPriorityFeePerGas: { 
        name: "Priority", 
        icon: "fluent-emoji:rocket", 
        duration: 15, 
        clazz: 'text-success',
        totalFee: ''
     },
})

const emits = defineEmits(["open", "close", "change"])

let popover = null;
const   txGasLimit = ref(props.gasLimit)
const   popBtnRef = ref()
const   popContentRef = ref()
const   opened = ref(false)
const   selected = ref(props.selectedFee)
const   dataState = ref(Date.now())
//const   editGasLimit = ref(false)


onMounted(() => {
    processFeeData()
    //popContentRef.value.classList.add("hidden")
    window.setTimeout(() => initPop(), 200)
})

const processFeeData = () => {

    let fLabels = feeLabelInfo.value
    let feeData = props.feeData
    let gas = BigInt(txGasLimit.value.toString())

    fLabels["gasPrice"].totalFee = formatUnits(feeData.gasPrice * gas, 18)
    fLabels["maxFeePerGas"].totalFee = formatUnits(feeData.maxFeePerGas * gas, 18)
    fLabels["maxPriorityFeePerGas"].totalFee = formatUnits(feeData.maxPriorityFeePerGas * gas, 18)

    feeLabelInfo.value = fLabels

    //console.log("feeLabelInfo.value===>", feeLabelInfo.value)

    dataState.value = Date.now()
    return true
}

watch(selected, () => {
   let name = selected.value
    emitChangeEvent(name, props.feeData[name])
})

watch(txGasLimit, () => {
    emitChangeEvent(selected.value, props.feeData[selected.value])
    processFeeData()
})

const initPop = () => {

    popover = new bsPopover(popBtnRef.value, {
        trigger: 'click',
        html: true, 
        sanitize: false,
        content: popContentRef.value,
        placement: 'top',
        fallbackPlacement:  'top',
        customClass: "rounded-lg shadow-lg",
        container: "#gasfee-picker-container"
    })

    let pBtn =  popBtnRef.value

    pBtn.addEventListener('shown.bs.popover', () => {
        opened.value = true
        emits("open", popBtnRef, popover)
    })

    pBtn.addEventListener('hidden.bs.popover', () => {
        opened.value = false
        emits("close", popBtnRef, popover)
    })
}

onBeforeUnmount(() => {
    if(popover){
        popBtnRef.value.removeEventListener('shown.bs.popover', ()=>{})
        popBtnRef.value.removeEventListener('hidden.bs.popover', ()=>{})
    }
})

const emitChangeEvent = (name, value ) => {
    let gasLimit = BigInt(txGasLimit.value.toString())
    emits("change", { name, value, gasLimit})
}

const handleFeeItemClick = (name) => {
    selected.value = name
}

const closePopover = () => {
    if(popover) popover.hide()
}

</script>
<template>
    <button 
        type="button" 
        class="btn ms-1 p-0 btn-primary rounded-circle w-25px h-25px center-vh"
        data-bs-toggle="popover"
        ref="popBtnRef"
    >
        <Icon v-if="!opened" name="mdi:gear" :size="16" />
        <Icon v-else name="ic:baseline-close" :size="16" />
    </button>
    <div ref="popContentRef" class="gasfee-picker">
        <div class="contentMain">
            <div class="d-flex justify-content-between">
                <div class="fs-12 fw-semibold hint mb-2">Network Fee</div>
            </div>
            <div>
                <table class="table table-hover w-full">
                    <thead>
                        <tr class='w-full'>
                            <th>Option</th>
                            <th>Time</th>
                            <th>Fee</th>
                        </tr>
                    </thead>
                    <tbody class="fs-14 fw-middle  w-full">
                        <template v-for="(key, index) in Object.keys(props.feeData)">
                            <tr @click.prevent="handleFeeItemClick(key)"
                                :class="`py-4 m-pointer break-text ${key==selected ? 'selected': ''}`"
                                :data-name="key"
                            >
                                <td>
                                    <div class="d-flex">
                                        <Icon :name='feeLabelInfo[key].icon' />
                                        <div class="ms-1">{{ feeLabelInfo[key].name }}</div>
                                    </div>
                                </td> 
                                <td :class="feeLabelInfo[key].clazz">
                                    {{ feeLabelInfo[key].duration }}s+
                                </td>
                                <td class='text-upper break-text' style="max-width: 100px;">
                                    {{  feeLabelInfo[key].totalFee }} {{ props.nativeTokenInfo.symbol }}
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
            <div class="mt-3 w-full">
                <div class="fs-12 fw-semibold hint mb-2">Gas Limit</div>
                <div class="d-flex align-items-center justify-content-start flex-nowrap fw-middle w-full">
                    <input 
                        type='text' 
                        v-model="txGasLimit"
                        v-integer
                        class="form-control form-control-sm rounded-pill flex-grow-1"
                        id="tx-gas-limit"
                    />
                    <button
                        class="btn btn-warning p-0 rounded-circle ms-1 w-25px h-25px center-vh"
                        type="button" 
                        id="reset-gas-limit"
                        @click.prevent="txGasLimit=props.onChainGasLimit"
                    >
                        <Icon name="uiw:reload" :size="16" />
                    </button>
                    
                </div>
            </div>
            <div class="mt-3 mb-2">
                <button 
                    id="close-gasfee-picker" 
                    class="btn btn-primary btn-sm fw-semibold w-full rounded-pill"
                    @click.prevent="closePopover"
                >
                    Close    
                </button>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.gasfee-picker{
    display: none;
}

.popover {

    --bs-popover-bg: var(--bs-body-bg-dark-8);
    
    //background: var(--bs-body-bg-dark-8) !important;
    border-radius: 12px;
    

    .popover-body {
        padding: 10px !important;
     
    }

    .gasfee-picker{

        display: inline-block;

        width: 260px !important;
        max-width: 98% !important;


        .selected {
        background: var(--bs-body-bg-dark-12);
            border-radius: 8px !important;
        }

        table {
        }

        th, td {
            text-align: center; 
            vertical-align: middle;
        }

        td {
            padding: 6px 4px;

            border: none;

            &:first-of-type {
                border-top-left-radius: 8px !important;
                border-bottom-left-radius: 8px !important;
            }

            &:last-of-type {
                border-top-right-radius: 8px !important;
                border-bottom-right-radius: 8px !important;
            }
        }
    }
}

</style>