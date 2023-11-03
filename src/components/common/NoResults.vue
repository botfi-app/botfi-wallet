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
        <div><img src='/images/empty_box.png' alt=''  /></div>
        <h5 class="fw-normal text-muted hint mt-1"> 
            {{ noResultsText }} 
        </h5>
    </div>
</template>
<style scoped>
img {
    width: 100px;
    height: auto;
}
</style>