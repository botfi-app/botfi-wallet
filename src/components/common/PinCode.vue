<script setup>
import { ref, watch } from 'vue';
const pincodeRef = ref()

const props = defineProps({
    label: { type: String, default: "Pin" }
})

const instanceId = Date.now()
const pinValues  = ref([])

const emits = defineEmits(["change"])

const handleInput = (e) => {

    let t = e.target
    let index = parseInt(t.dataset.index);

    //let value = ""

    if(e.key == "*") return false;

    let idStr = `pin-${instanceId}`
    
    if(/[0-9]+/i.test(e.key)) {
        
        if(index < 4){
            t.blur()
           document.querySelector(`#${idStr}-`+(index+1)).focus()
        }

        //value = e.key;

        pinValues.value[index] = e.key

        window.setTimeout(()=> e.target.value = "*", 50)

    } else if(['Backspace', 'Delete'].includes(e.key)){

        let oldValue = pinValues.value[index].toString().trim()

        pinValues.value[index] = ""
        
        if(index > 0 && oldValue == ''){
            t.blur()
            document.querySelector(`#${idStr}-`+(index-1)).focus()
        }

    } else {
        e.target.value = ''
        return false
    }
}

const handleFocus = (e) => {
    let t = e.target;
    let index = parseInt(t.dataset.index);
    //console.log(pinValues.value)
    let pv = pinValues.value[index] || ""
    if(pv != '') t.value = pv
}

const handleBlur = (e) => {
    let t = e.target;
    let index = parseInt(t.dataset.index);
    let pv = pinValues.value[index] || ""
    if(pv != '') t.value = '*'
}

watch(pinValues, () => {
    emits("change", pinValues.value.join(""))
    //console.log(pinValues.value.join(""))
}, { deep: true })
</script>
<template>
    <div>
        <div class="px-2 mt-2">
            <label class="fw-bold text-muted">{{ props.label }}</label>
        </div>
        <div class="d-flex flex-row justify-content-center">
            <template v-for="index in Array(5).keys()" :key="index">
                <div>
                    <input
                        type="text"
                        max="1"
                        min="1"
                        inputmode="numeric" 
                        maxlength="1"
                        minlength="1"
                        step="1"
                        placeholder=""
                        :data-index="index"
                        :id="`pin-${instanceId}-${index}`"
                        class="pin-input text-center form-control rounded shadow"
                        @keyup="handleInput"
                        @focus="handleFocus"
                        @blur="handleBlur"
                        pattern="[0-9]*"
                    />
                </div>
            </template>
        </div>
    </div>
</template>
<style lang="scss">
    .pin-input{
        width: 50px;
        height: 50px;
        margin: 5px;
        font-size: 18px;
        font-weight: bold
    }
</style>