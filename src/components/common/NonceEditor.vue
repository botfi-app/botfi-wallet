<script setup>
import { ref } from 'vue';


const p = defineProps({
    nonce: { type: Number, required: true }
})

//console.log("p.nonce==>", p.nonce)
//const txNonce = ref(p.nonce || "")
const editNonceInput = ref()
const txNonce = ref(p.nonce)
const editNonce = ref(false)

const toggleEditNonce = () => {
    editNonce.value = !editNonce.value
    if(editNonce.value) {
        editNonceInput.value.focus()
    }
}
</script>
<template>
    <div class="d-flex align-items-center justify-content-between my-3 w-full">
        <div class="fs-11 hint fw-semibold text-upper  text-start">
            Nonce
        </div>
        <div class="ps-3 center-vh fw-middle" :key="editNonce">
            <input 
                type='text' 
                v-model="txNonce"
                v-integer 
                class="form-control form-control-sm nonce rounded-pill"
                :disabled="!editNonce"
                ref="editNonceInput"
            />
            <button
                class="btn btn-danger p-0 rounded-circle ms-1 w-25px h-25px center-vh"
                @click.prevent="toggleEditNonce"
                type="button" 
            >
                <Icon v-if="!editNonce" name="mdi:gear" :size="16" />
                <Icon v-else name="ic:baseline-close" :size="16" />
            </button>
            
        </div>
    </div>
</template>