<script setup>
import { useNetworks } from '../../composables/useNetworks';
import Image from '../common/Image.vue';

const { isNetReady, activeNetwork } = useNetworks()

</script>
<template>
    <button v-if="isNetReady" 
        class="btn center-vh rounded-circle net-select-btn px-0 shadow"
    >
        <Image 
            :width="30" 
            :height="30" 
            class="rounded-circle shadow"
            :src="activeNetwork.icon" 
            :placeholder="activeNetwork.name"
        />
    </button>
</template>
<style lang="scss">
.net-select-btn {
    background: rgba(255,255,255,0.6);
}
</style>