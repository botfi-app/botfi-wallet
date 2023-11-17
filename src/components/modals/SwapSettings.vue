<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';

const p = defineProps({
    slippage: { type: Number, required: true }
})

const id = ref("swapSettings")
const defaultSlippageArr = [ 0.5, 1, 1.5, 2 ]

const userSlippage = ref(p.slippage)
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
                                    ${(userSlippage == i) ? 'btn-warning' : 'btn-soft-primary' }
                                    fw-medium
                                `"
                            >
                                {{ i }}%
                            </button>
                        </template>
                        <div class="d-flex align-items-center ms-3">
                            <input 
                                type="text"
                                class="rounded-lg px-1 text-center fw-medium"
                                v-model="userSlippage"
                            />
                            <div class="fw-medium ms-1">
                                %
                            </div>
                        </div>
                    </div>
                </div>
           </div>
        </template>
    </Modal>
</template>
<style scoped lang="scss">
 .btn.slippage, input {
    width: 55px !important;
    height: 40px !important;
 }

 input {
    background: transparent !important;
    border: 2px solid var(--bs-primary);
 }
</style>