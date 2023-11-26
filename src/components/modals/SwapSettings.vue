<script setup>
import { ref, watch } from 'vue';
import Modal from './Modal.vue';
import { useSwap } from '../../composables/useSwap';


const id = ref("swapSettings")
const defaultSlippageArr = [ 0.5, 1, 1.5, 2 ]

const { swapSetting, saveSwapSetting } = useSwap()
const slippage = ref(swapSetting.value.slippage)


const updateSetting = async() => {
    await saveSwapSetting({ 
        slippage: slippage.value,
        //saveSlippage: saveSlippage.value
    })
}


watch(slippage, updateSetting);
//watch(saveSlippage, updateSetting);
</script>
<template>
    <Modal
        :id="id"
        title="Setting"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
    >
        <template #body>
           <div class="py-4 px-2">
                <div class="splippage">
                    <h6 class="fw-medium">Max. Slippage</h6>
                    <div class="d-flex">
                        <template v-for="i in defaultSlippageArr" :key="i">
                            <button 
                                :class="`
                                    btn  
                                    rounded-lg 
                                    px-0 
                                    slippage 
                                    mx-1 
                                    ls-1
                                    ${(slippage == i) ? 'btn-warning' : 'btn-soft-primary' }
                                    fw-medium
                                `"
                                @click="slippage = i"
                            >
                                {{ i }}%
                            </button>
                        </template>
                        <div class="d-flex align-items-center ms-3">
                            <input 
                                type="text"
                                class="rounded-lg px-1 text-center fw-medium custom-slippage"
                                v-model="slippage"
                            />
                            <div class="fw-medium ms-1">
                                %
                            </div>
                        </div>
                    </div>
                </div>
                <!--<div class="mt-4 mx-2">
                    <div class="form-check">
                        <input 
                            v-model="saveSlippage"
                            class="form-check-input" 
                            type="checkbox" 
                            id="save-slippage"
                        />
                        <label class="form-check-label" for="save-slippage">
                            Save slippage for future swaps
                        </label>
                    </div>
                </div>
                -->
           </div>
        </template>
    </Modal>
</template>
<style scoped lang="scss">
 .btn.slippage, .custom-slippage {
    width: 55px !important;
    height: 40px !important;
 }

 input {
    background: transparent !important;
    border: 2px solid var(--bs-primary);
 }
</style>