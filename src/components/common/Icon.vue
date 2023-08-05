<script setup>
import { Icon as Icn } from '@iconify/vue';

const props = defineProps({
    name: { type: String, required: true },
    size: { type: Number, default: 20 }
})
</script>
<template>
    <Icn :icon="props.name" 
         :height="props.size" 
         :width="props.size" 
         v-bind="$attrs" 
    />
</template>