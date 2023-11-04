<script setup>
import { nextTick, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import Utils from '../../../classes/Utils';

const props = defineProps({
    limit: { type: null, default: null },
    enableViewAllBtn: { type: Boolean, default: false }
})

</script>
<template>
    <div class="mt-3">    
        <ActivityList 
            :limit="props.limit"
            :enableViewAllBtn="props.enableViewAllBtn"
        />
    </div>
</template>