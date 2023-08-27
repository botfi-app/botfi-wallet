<script setup>

const props = defineProps({
    title: { type: String, default: "" }
})


</script>
<template>
    <div class="pt-4">
        <div class="d-flex justify-content-center align-items-center">
            <div>
                <h5 v-if="props.title != ''" class="fw-semibold text-muted">
                    {{ props.title  }}
                </h5>
            </div>
        </div>
    </div>
</template>