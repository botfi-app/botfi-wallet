<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';

const props = defineProps({
    opened: { type: Boolean, default: false },
   // title: { type: String, default: '' },
    message: { type: String, default: '' }
})

const emits = defineEmits(["close"])

const isOpened = ref(props.opened)
//const title = computed( () => props.title)
const message = computed( () => props.message)

watch(isOpened, () => {
   if(!isOpened.value) { emits("close") }
}, { deep: true })

</script>
<template>
    <Teleport to="body">
        <k-dialog
            :opened="isOpened"
        >
        <p class="text-md pt-2">{{ message }}</p>
        <template #buttons>
            <k-dialog-button @click="() => (isOpened = false)">
                Ok
            </k-dialog-button>
        </template>
    </k-dialog>
    </Teleport>
</template>