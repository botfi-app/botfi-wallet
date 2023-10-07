<script setup>
import Utils from "../../classes/Utils"

const props = defineProps({
    text: { type: String, required: true },
    showToast: { type: Boolean, default: true },
    successText: { type: String, default: "Copied" },
    failedText: { type: String, default: "Failed to copy" },
    btnClasses: { type: String, default: "" }
})


</script>
<template>
<a href="#" @click.prevent="Utils.copyText({ ...props })" :class="props.btnClasses">
    <Icon name="solar:copy-bold-duotone" :size="24" />
</a>
</template>