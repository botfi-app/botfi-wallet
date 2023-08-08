<script setup>
import { ref } from 'vue';
import BAvatar from 'vue-boring-avatars'

const props = defineProps({
    name: { type: String, required: true },
    size: { type: Number, default: 24 },
    variant: { type: String, default: 'bauhaus' }
})

const colors = ref(["#3bedb2", "#FAB612", "#e91e63"])
</script>
<template>
    <BAvatar 
        :colors="colors"
        :name="props.name"
        :variant="props.variant"
        :size="props.size"
    />
</template>