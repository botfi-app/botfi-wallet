<script setup>
import { ref, watch } from 'vue';


const props = defineProps({
    label: { type: String, default: "Pin" }
})

const id = ref("pin-input-"+Date.now())
const pinValue = ref("")
const inputType = ref("password")
const emits = defineEmits(["change"])


watch(pinValue, () => {
    emits("change", pinValue.value)
})
</script>
<template>
    <div>
        <label :for="id" class="fw-bold hint mb-2">
            {{ props.label }}
        </label>
        <input 
            :type="inputType" 
            class="form-control pin-input form-control-lg rounded" 
            :id="id" 
            :placeholder="'&#x2022;'.repeat(6)"
            v-model="pinValue"
            maxlength="6"
            v-integer
            inputmode="numeric"
        />
       
    </div>
</template>
<style lang="scss">
    .pin-input{
        width: 100% !important;
        letter-spacing: 28px;
        word-spacing: 16px;
        font-weight: bolder;
        text-align: center;
        overflow-x: hidden;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;

        &::placeholder {
            font-size: 28px !important;
     
        }
    }

</style>