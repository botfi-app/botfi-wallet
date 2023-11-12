<script setup>
    const p = defineProps({
        text: { type: String, default: ''},
        size: { type: String, default: '' }
    })
</script>
<template>
    <div class="my-1">
        <div :class="`spinner-box ${p.size}`">
            <div class="configure-border-1">  
                <div class="configure-core"></div>
            </div>  
            <div class="configure-border-2 last">
                <div class="configure-core"></div>
            </div> 
        </div>
        <div v-if="p.text != ''" 
            class="text-center fw-semibold text-upper ls-2 fs-11 mt-2 mb-2 hint text-muted"
        >
         {{ p.text }}
        </div>
    </div>
</template>