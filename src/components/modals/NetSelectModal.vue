<script setup>
import { useNetworks } from '../../composables/useNetworks';
import Image from '../common/Image.vue';

const { isNetReady, activeNetwork } = useNetworks()

</script>
<template>
    <router-link
        to="/networks?r=/browser&returnOnSelect" 
        v-if="isNetReady" 
        type="button" 
        class="btn position-relative rounded-circle p-0 m-0 net-select-btn bg-white"
    >
        <Image 
            :width="30" 
            :height="30" 
            class="rounded-circle"
            :src="activeNetwork.image || ''" 
            :placeholder="activeNetwork.chainName"
            :key="activeNetwork.chainName"
        />
        <span class="position-absolute bottom-0 start-0  p-1 bg-success border border-none rounded-circle">
        </span>
    </router-link>
</template>
<style lang="scss">

</style>