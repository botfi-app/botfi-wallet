<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, onBeforeMount } from "vue"
import { Popover as bsPopover } from 'bootstrap'
import { formatUnits } from "ethers";
import Utils from "../../classes/Utils"

const props = defineProps({
    nativeTokenInfo: { type: Object, required: true },
    feeData: { type: Object, required: true },
    popoverOpts: { type: Object, default: {} },
    gasLimit: { type: BigInt, required: true },
    onChainGasLimit: { type: BigInt, required: true },
    placement:   { type: String, default: '' },
    container: { type: String, default: 'body' },
    selected: { type: String, default: 'market' }
})


const uiFeeItems = ref({})

const emits = defineEmits(["show", "hide", "change"])

console.log("props==>", props.gasLimit)

let popover = null;
const   txGasLimit = ref(props.gasLimit)
const   txGasLimitUint = ref(BigInt(props.gasLimit.toString()))
const   popBtnRef = ref()
const   popContentRef = ref()
const   opened = ref(false)
const   selected = ref(props.selected)
const   dataState = ref(Date.now())
const   container = ref()
//const   editGasLimit = ref(false)

onBeforeMount(() => {
    processFeeData()
})

onMounted(() => {
    //popContentRef.value.classList.add("hidden")
    setTimeout(() => initPop(), 10)
})


const processFeeData = () => {

    let fd = props.feeData
    let gasLimit = BigInt(txGasLimit.value.toString())

    //console.log("feeData===>", feeData)
    
    let priorityFeeUint = null;

    if(fd.supportsEip1559Tx && fd.maxPriorityFeePerGas != null){
        priorityFeeUint = fd.maxFeePerGas + fd.maxPriorityFeePerGas
    }

    let totalFeeDecimals = (value) =>  formatUnits(value * gasLimit, 18)

    uiFeeItems.value = {
        low: { 
            name: "Low",
            icon: "emojione:turtle", 
            duration: 60, 
            clazz: 'text-danger',
            maxFeePerGas:           fd.gasPrice,
            totalFee:               (fd.gasPrice * gasLimit),
            totalFeeDecimals:       totalFeeDecimals(fd.gasPrice),
            maxPriorityFeePerGas:    0
        },
        market: { 
            name: "Market", 
            icon: "emojione:horse", 
            duration: 30, 
            clazz:   'text-warning',
            maxFeePerGas:           fd.maxFeePerGas,
            totalFee:               (fd.maxFeePerGas * gasLimit),
            totalFeeDecimals:       totalFeeDecimals(fd.maxFeePerGas),
            maxPriorityFeePerGas:   null//fd.maxPriorityFeePerGas
        }
    }

    if(priorityFeeUint != null){
        uiFeeItems["priority"] =  { 
            name: "Priority", 
            icon: "fluent-emoji:rocket", 
            duration: 15, 
            clazz: 'text-success',
            maxFeePerGas:           priorityFeeUint,
            totalFee:               (priorityFeeUint * gasLimit),
            totalFeeDecimals:       totalFeeDecimals(priorityFeeUint),
            maxPriorityFeePerGas:   fd.maxPriorityFeePerGas,
        }
    }

    //lets emit 
    emitChangeEvent((selected.value || 'market'))

    dataState.value = Date.now()
    return true
}


const emitChangeEvent = (key) => {
    
    selected.value = key

    let item = uiFeeItems.value[key]

    //console.log("item===>", item)

    emits("change",{ 
        gasLimit:               txGasLimitUint.value, 
        maxFeePerGas:           item.maxFeePerGas, 
        totalFee:               item.totalFee,
        maxPriorityFeePerGas:   item.maxPriorityFeePerGas,
        totalFeeDecimals:       item.totalFeeDecimals
    })
}

watch(txGasLimit, () => {
    txGasLimitUint.value = BigInt(txGasLimit.value.toString())
    processFeeData()
})

/*
const fixContainerHeight = () => {
    let c= document.querySelector(props.container)
    if(!c) return;

    c.style.position = 'fixed'

    container.value = c
}*/

const initPop = () => {

   // fixContainerHeight()

    popover = new bsPopover(popBtnRef.value, {
        trigger:            'click',
        html:               true, 
        sanitize:           false,
        content:            popContentRef.value,
        placement:          props.placement,
        fallbackPlacement:  [props.placement],
        customClass:        "rounded-lg shadow-lg",
        container:          props.container,
    })

    let pBtn =  popBtnRef.value

    pBtn.addEventListener('show.bs.popover', () => {
        opened.value = true
        emits("show", popBtnRef, popover)
    })

    pBtn.addEventListener('hide.bs.popover', () => {
        opened.value = false
        emits("hide", popBtnRef, popover)
    })
}

onBeforeUnmount(() => {
    if(popover){
        popBtnRef.value.removeEventListener('show.bs.popover', ()=>{})
        popBtnRef.value.removeEventListener('hide.bs.popover', ()=>{})
    }
})


const handleFeeItemClick = (key) => {
    emitChangeEvent(key);
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
            <div class="d-flex justify-content-center my-1">
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
                        <template v-for="(item, key) in uiFeeItems">
                            <tr @click.prevent="handleFeeItemClick(key)"
                                :class="`py-4 m-pointer break-text ${key==selected ? 'selected': ''}`"
                                :data-key="key"
                            >
                                <td>
                                    <div class="d-flex">
                                        <Icon :name='item.icon' />
                                        <div class="ms-1 text-capitalize">{{ item.name }}</div>
                                    </div>
                                </td> 
                                <td :class="item.clazz">
                                    {{ item.duration }}s+
                                </td>
                                <td class='text-upper break-text' style="max-width: 100px;">
                                    {{  Utils.formatCrypto(item.totalFeeDecimals, 4) }} 
                                    {{ props.nativeTokenInfo.symbol }}
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
                        class="btn btn-info p-0 rounded-circle ms-1 w-25px h-25px center-vh"
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
                    class="btn btn-soft-primary w-full rounded-lg"
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
            background: rgba(var(--bs-primary-rgb),0.3);
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