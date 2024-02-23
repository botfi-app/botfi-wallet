<script setup>
import { nextTick, onMounted, ref } from 'vue';
import Icon from '../common/Icon.vue';
import Image from '../common/Image.vue';
import Utils from '../../classes/Utils';

const p = defineProps({
    isPrimary: { type: Boolean, default: false},
    tokenInfo: { type: null, required: true },
    isFocused: { type: Boolean, default: false },
    inputAttrs: { type: Object, default: {} }
})

const emit = defineEmits(['ready','open-token-select-modal', 'input-change', 'balance-click'])

const inputVal = ref()
const inputRef = ref()

const openTokenSelectModal = () => {
    emit("open-token-select-modal")
}

const handleOnItemChange = async (e) => {
    
    let inputVal2 = inputVal.value

    await Utils.sleep(2)

    // if user is still typing, dont send the event yet
    if(inputVal.value != inputVal2) return true;

    //console.log("inputVal.value===>", inputVal.value)
    emit("input-change", inputVal.value)
}

onMounted(() => {
    nextTick(() => {
        emit("ready", inputRef.value)
    })
})

const getBalance = () => {
    let balance = (p.tokenInfo || {}).balanceInfo || null
    if(balance == null || !balance.formatted) return "0"
    return Utils.formatCrypto(balance.formatted || 0, 4)
}
</script>
<template>
    <div>
        <div class="input-wrapper px-3 py-3 rounded-lg">
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <div  v-if="p.tokenInfo != null">
                        <button @click.prevent="openTokenSelectModal" 
                            class="btn asset center-vh btn-none p-0 rounded-pill"
                        >
                            <Image 
                                :src="p.tokenInfo.image" 
                                :placeholder="p.tokenInfo.symbol" 
                                :width="24"
                                :height="24"
                                class="rounded-circle"
                            />
                            <div class="fw-meium px-2 text-upper">{{ p.tokenInfo.symbol }}</div>
                            <Icon name="fluent:chevron-down-24-filled" />
                        </button>
                    </div>
                    <div v-else>
                        <button @click.prevent="openTokenSelectModal" 
                            class="btn fw-medium btn-primary rounded-pill"
                        >
                            <div class="d-flex align-items-center">
                                <div class="me-2 fw-semibold">Select</div>
                                <Icon name="fluent:chevron-down-24-filled" />
                            </div>
                        </button>
                    </div>
                </div>
                <div v-if="p.tokenInfo != null" 
                    class="d-flex center-vh fs-14 lh-2  hint m-pointer"
                    @click="emit('setBalance', 100)"
                >
                    <div class=''>Balance:</div> 
                    <div class='ms-1'>{{ getBalance() }}</div>
                </div>
            </div>  
            <div class="flex-grow-1 mt-2 d-flex">
                <input 
                    type="text" 
                    v-number
                    class="w-full amount-input fw-bold fs-4 flex-grow-1"
                    placeholder="0"
                    :autofocus="isFocused"
                    v-bind="p.inputAttrs"
                    @input="handleOnItemChange"
                    ref="inputRef"
                    v-model="inputVal"
                />
                <div class="d-flex" v-if="p.isPrimary">
                    <template v-for="(value, percent) in {50: '50%', 100: 'Max'}">
                        <button @click="emit('setBalance', percent)"
                            class="btn btn-outline-primary btn-sm rounded m-1"
                        >
                            {{ value }}
                        </button>
                    </template>
                </div>
            </div>
        </div>  
    </div>
</template>