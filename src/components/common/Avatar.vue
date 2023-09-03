<script setup>
import { ref } from 'vue';
import BAvatar from 'vue-boring-avatars'
import pcolors from 'nice-color-palettes'
import Utils from '../../classes/Utils';

const props = defineProps({
    name: { type: String, required: true },
    size: { type: Number, default: 24 },
    variant: { type: String, default: 'bauhaus' },
    square: { type: Boolean, default: false }
})

//const colors = Utils.arrayRandom(pcolors)

</script>
<template>
    <BAvatar 
        :colors="Utils.arrayRandom(pcolors)"
        :name="props.name"
        :variant="props.variant"
        :size="props.size"
        :square="props.square"
    />
</template>