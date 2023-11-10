<script setup>
import Icon from '../common/Icon.vue';

const p = defineProps({
    tokenInfo: { type: Object, required: true }
})
</script>
<template>
    <div class="d-flex input-wrapper p-2 py-3 rounded" v-if="p.tokenInfo != null">
        <div class="flex-grow-0">
            <div class="asset from" v-if="p.tokenInfo == null">
                <Image :src="p.tokenInfo.image" :placeholder="p.tokenInfo.symbol" />
            </div>
            <div v-else>
                <button class="btn px-4 fw-medium btn-primary rounded-pill">
                    <div class="d-flex align-items-center">
                        <div class="me-2">Select Token</div>
                        <Icon name="fluent:chevron-down-24-filled" />
                    </div>
                </button>
            </div>
        </div>  
        <div class="flex-grow-1">
            
        </div>  
    </div>
</template>