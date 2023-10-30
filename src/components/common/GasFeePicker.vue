<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { Popover as bsPopover } from 'bootstrap'
import { formatUnits } from "ethers";

const props = defineProps({
    nativeTokenInfo: { type: Object, required: true },
    feeData: { type: Object, required: true },
    popoverOpts: { type: Object, required: true },
    gasLimit: { type: BigInt, required: true },
    placement: { type: String, default: 'left' },
})

const txGasLimit = ref(props.gasLimit)

const feeLabelInfo = ref({
    gasPrice: { name: "Low", icon: "emojione:turtle", duration: 60, clazz: 'text-danger' },
    maxFeePerGas: { name: "Market", icon: "emojione:horse", duration: 30, clazz: 'text-warning' },
    maxPriorityFeePerGas: { name: "Priority", icon: "fluent-emoji:rocket", duration: 15, clazz: 'text-success' },
})

const emit = defineEmits(["open", "close"])

let popover = null;
const  popBtnRef = ref()
const  popContentRef = ref()
const opened = ref(false)
const selected = ref("maxFeePerGas")

onMounted(() => {
  window.setTimeout(() => initPop(), 200)
})

const processFeeData = () => {

    let fl = feeLabelInfo.value
    let fd = props.feeData
    let gl = txGasLimit.value

    fl["gasPrice"].totalFee = formatUnits(fd.gasPrice * gl, 18)
    fl["maxFeePerGas"].totalFee = formatUnits(fd.maxFeePerGas * gl, 18)
    fl["maxPriorityFeePerGas"].totalFee = formatUnits(fd.maxPriorityFeePerGas * gl, 18)

    feeLabelInfo.value = fl

    console.log("feeLabelInfo.value===>", feeLabelInfo.value)
}

watch(txGasLimit, () => {
    processFeeData()
})

const initPop = () => {

   processFeeData()

    let pContent = popContentRef.value.cloneNode(true)
    pContent.classList.remove("hidden")

    popover = new bsPopover(popBtnRef.value, {
        trigger: 'click',
        html: true, 
        //title: 'Network Fee', 
        content: pContent,
        placement: 'top',
        fallbackPlacement:  'top',
        customClass: "rounded-lg shadow-lg gas-picker"
    })

    popBtnRef.value.addEventListener('shown.bs.popover', () => {
        opened.value = true
    })

    popBtnRef.value.addEventListener('hidden.bs.popover', () => {
        opened.value = false
    })
}

onBeforeUnmount(() => {
    if(popover){
        popBtnRef.value.removeEventListener('shown.bs.popover', ()=>{})
        popBtnRef.value.removeEventListener('hidden.bs.popover', ()=>{})
    }
})
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
    <div ref="popContentRef" class="hidden">
        <div class="d-flex justify-content-between">
            <div class="fs-12 fw-semibold hint">Network Fee</div>
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
                <tbody class="fs-15  w-full">
                    <template v-for="(key, index) in Object.keys(props.feeData)">
                        <tr :class="`py-4 ${key==selected ? 'selected': ''}`">
                            <td>
                                <div class="d-flex">
                                    <Icon :name='feeLabelInfo[key].icon' />
                                    <div class="ms-1">{{ feeLabelInfo[key].name }}</div>
                                </div>
                            </td> 
                            <td :class="feeLabelInfo[key].clazz">
                                {{ feeLabelInfo[key].duration }}s+
                            </td>
                            <td>
                                {{  feeLabelInfo[key].totalFee || "" }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>
<style lang="scss">
.gas-picker {
    width: 260px !important;
    max-width: 98% !important;

    .popover-body {
        padding: 10px !important;
    }

    .selected {
       background: var(--bs-body-bg-dark-5);
        border-radius: 8px !important;
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

</style>