<script setup>
import { ref } from "vue"

const props = defineProps({
    nativeTokenInfo: { type: Object, required: true },
    feeData: { type: Object, required: true },
    popoverOpts: { type: Object, required: true }
})

const emit = defineEmits(["open", "close"])

const opened = ref(false)

</script>
<template>
    <button type="button" 
        class="btn ms-1 p-0 btn-primary rounded-circle w-25px h-25px center-vh"
        data-bs-toggle="popover"
    >
        <Icon v-if="!opened" name="mdi:gear" :size="16" />
        <Icon v-else name="ic:baseline-close" :size="16" />
    </button>
</template>