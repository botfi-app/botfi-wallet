<script setup>
import { onBeforeMount, onBeforeUnmount, inject } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    url: { type: String, default: null }
})

const botUtils = inject("botUtils")
const router = useRouter()
let backBtn = null

onBeforeMount(() => {
    let backFun = (props.url) 
                    ? () => router.push(props.url) 
                    : () => router.back()
                    
    backBtn = botUtils.backBtn(backFun)
    backBtn.enable()
    backBtn.show()
})

onBeforeUnmount(() => {
    if(backBtn == null) return;
    backBtn.disable(true)
})
</script>
<template></template>