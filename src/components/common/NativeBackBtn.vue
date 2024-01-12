<script setup>
import { onBeforeMount, onBeforeUnmount, inject, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    url: { type: String, default: "" }
})

const botUtils = inject("botUtils")
const router = useRouter()
const backBtn = ref(null)
const callbackFunc = ref(null)

onBeforeMount(() => {
    let url = props.url.trim();

    if(url == '') {
        url = "/wallet"
    }

    callbackFunc.value = () => router.push(url) 

    let _backBtn = botUtils.backBtn(callbackFunc.value)

   // console.log("_backBtn===>", _backBtn)

    if(_backBtn != null && _backBtn.isSupported()){
        
        _backBtn.enable()
        _backBtn.show()

        backBtn.value = _backBtn
    }

    
})

onBeforeUnmount(() => {
    if(!backBtn.value) return;
    backBtn.value.disable(true)
})
</script>
<template>
    <div v-if="backBtn == null || !backBtn.isSupported()">
       <div class="d-flex align-items-center justify-content-start mt-2">
            <Icon name="carbon:arrow-left" class="me-2" />
            <span>Back</span>
       </div> 
    </div>
</template>