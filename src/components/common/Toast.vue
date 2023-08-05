<script setup>
import { onMounted, ref } from 'vue';
import { useEventBus } from '../../composables/useEventBus';

const eventBus = useEventBus()
const opened = ref(false)
const text = ref("")

onMounted(() => {
    eventBus.on("open-toast", (data) => {
        console.log(data)
        text.value = data.text || ""
        opened.value = true 

        let autoclose = data.autoclose || false 

        if(autoclose){
            window.setTimeout(()=> opened.value = false, 10_000 )
        }
    })
})
</script>
<template>
    <k-toast position="center" :opened="opened">
        <template #button>
          <k-button clear inline @click="() => (opened = false)">
            Close
          </k-button>
        </template>
        <div class="shrink">{{ text }}</div>
    </k-toast>
</template>