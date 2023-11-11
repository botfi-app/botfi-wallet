<script setup>

import { onBeforeMount, ref, inject } from "vue"

const props = defineProps({
    containerClass: { type: String, default:"d-flex flex-wrap" },
    text: { type: String, default: "" }
})


const noResultsText = ref("")

onBeforeMount(() => {
    noResultsText.value = (props.text.trim() != "")
                            ? props.text
                            : "No Records"
})

</script>
<template>
    <div :class="`mt-2 d-flex flex-column align-items-center justify-content-center ${containerClass}`">
        <div><img src='/images/no_data.png' alt=''  /></div>
        <div class="fw-semibold  fs-12 ls-2 text-muted hint mt-1"> 
            {{ noResultsText }} 
        </div>
    </div>
</template>
<style scoped>
img {
    width: 80px;
    height: auto;
}
</style>