<script setup>
import { onBeforeMount, ref } from 'vue';
import BAvatar from 'vue-boring-avatars'
import pcolors from 'nice-color-palettes/1000.json'
import Utils from '../../classes/Utils';
import randomColor from 'randomcolor';

const props = defineProps({
    name: { type: String, required: true },
    size: { type: Number, default: 24 },
    variant: { type: String, default: 'bauhaus' },
    square: { type: Boolean, default: false }
})

const randColor = ref([])

onBeforeMount(() => {
    randColor.value = Utils.arrayRandom(pcolors, props.name)
})
</script>
<template>
    <BAvatar 
        :colors="randColor"
        :name="props.name"
        :variant="props.variant"
        :size="props.size"
        :square="props.square"
    />
</template>