<script setup>
import TopBackBtn from './TopBackBtn.vue';

const props = defineProps({
    hasBackBtn: { type: Boolean, default: false},
    onBackBtnClick: { type: Function, default: null },
    title: { type: String, default: "" }
})


</script>
<template>
    <div class="pt-4">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h5 v-if="props.title != ''" class="fw-semibold text-muted">
                    {{ props.title  }}
                </h5>
            </div>
            <div />
        </div>
    </div>
</template>