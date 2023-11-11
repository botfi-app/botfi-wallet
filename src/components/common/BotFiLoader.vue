<script setup>
    const p = defineProps({
        text: { type: String, default: ''}
    })
</script>
<template>
    <div>
        <div class="spinner-box">
            <div class="configure-border-1">  
                <div class="configure-core"></div>
            </div>  
            <div class="configure-border-2 last">
                <div class="configure-core"></div>
            </div> 
        </div>
        <div v-if="p.text != ''" 
            class="text-center fw-semibold text-upper ls-2 fs-11 mt-3 hint text-muted"
        >
         {{ p.text }}
        </div>
    </div>
</template>