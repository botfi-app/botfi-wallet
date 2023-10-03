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
                            : "Nothing Here"
})

</script>
<template>
    <div :class="`mt-2 d-flex flex-column align-items-center justify-content-center ${containerClass}`">
        <div><Lottie name="empty_ghost" class="" /></div>
        <h5 class="fw-medium text-muted hint"> 
            {{ noResultsText }} 
        </h5>
    </div>
</template>