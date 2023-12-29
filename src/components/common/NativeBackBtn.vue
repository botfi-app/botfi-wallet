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
    let url = props.url.trim();

    if(url == '') {
        url = "/wallet"
    }

    let func = () => router.push(url) 

    backBtn = botUtils.backBtn(func)

    if(backBtn && backBtn.isSupported()){
        backBtn.enable()
        backBtn.show()
    }
})

onBeforeUnmount(() => {
    if(!backBtn) return;
    backBtn.disable(true)
})
</script>
<template></template>