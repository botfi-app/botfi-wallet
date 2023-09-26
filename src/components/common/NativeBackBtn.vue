<script setup>
import { onBeforeMount, onBeforeUnmount, inject } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    url: { type: String, default: "" }
})

const botUtils = inject("botUtils")
const router = useRouter()
let backBtn = null

onBeforeMount(() => {
    let backFun = (props.url.trim() == '') 
                    ? () => router.back()
                    : () => router.push(props.url) 
    
    //console.log("backFun===>", backFun)
    ///console.log("props===>", props.url)

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