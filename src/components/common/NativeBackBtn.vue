<script setup>
import { onBeforeMount, onBeforeUnmount, inject } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
                onBack: { type: Function, default: null }
            })

const botUtils = inject("botUtils")
const router = useRouter()
let backBtn = null

onBeforeMount(() => {
    let backFun = (props.onBack) ? props.onBack : () => router.go(-1)
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