<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
    opened: { type: Boolean, default: false },
    message: { type: String, default: '' },
    canClose: { type: Boolean, default: true },
})

const emits = defineEmits(["hide"])

const isOpened = ref(props.opened)
const message  = computed( () => props.message)
const canClose = computed( () => props.canClose)

watch(isOpened, () => {
   if(!isOpened.value) { emits("hide") }
}, { deep: true })

</script>

<template>
    <k-dialog
        :opened="isOpened"
        :translucent="true"
    >   
        <div class="flex flex-col items-center justify-center pt-3">
            <div class="text-center my-2">
                <k-preloader size='w-6 h-6' class="k-color-botfi-primary" />
            </div>
            <div class="text-lg">{{ message }}</div>
        </div>
        <template #buttons>
            <k-dialog-button v-if="canClose" @click="() => (isOpened = false)">
                Close
            </k-dialog-button>
        </template>
    </k-dialog>
</template>