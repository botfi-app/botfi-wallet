<script setup>

import { onBeforeMount, ref, inject } from "vue"

const props = defineProps({
    containerClass: { type: String, default:"d-flex flex-wrap" },
    text: { type: String, default: "" }
})

const $t = inject("$t")
const noResultsText = ref("")

onBeforeMount(() => {
    noResultsText.value = (props.text.trim() != "")
                            ? props.text
                            : $t("nothing_here")
})

</script>
<template>
    <div :class="`mt-2 d-flex flex-column align-items-center justify-content-center ${containerClass}`">
        <Lottie name="empty_ghost" class="" />
        <h3 class="text-muted"> 
            {{ noResultsText }} 
        </h3>
    </div>
</template>