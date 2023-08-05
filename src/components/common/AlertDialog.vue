<script setup>
import { onBeforeMount, ref } from 'vue';
import { useEventBus } from '../../composables/useEventBus';

const eventBus = useEventBus()
const isOpened = ref(false)
const title = ref("")
const message = ref("")

onBeforeMount(() => {
    eventBus.on("open-dialog", (data) => {
        isOpened.value = true
        title.value    = data.title || ""
        message.value  = data.message || ""
    })

    eventBus.on("close-dialog", () => {
        isOpened.value = false
    })
})

const open = () => {
    isOpened.value = true
}
</script>
<template>
    <Teleport to="body">
        <k-dialog
            :opened="isOpened"
            @backdropclick="() => (isOpened = false)"
        >
      <template #title>{{ title }}</template>
        {{ message }}
        <template #buttons>
            <k-dialog-button @click="() => (isOpened = false)">
                Ok
            </k-dialog-button>
        </template>
    </k-dialog>
    </Teleport>
</template>