<script setup>
import { ref } from 'vue';

const  mainToast = ref()

const closeToast = async () => {
    mainToast.value.classList.add("hide")
}
</script>
<template>
    <Teleport to="body">
        <div id="main-toast" 
            ref="mainToast"
            class="hide"
        >
            <div class="tst-body d-flex align-items-center justify-content-between shadow rounded">
                <div class="text  fw-semibold text-truncate pe-2"></div>
                <button type="button" @click="closeToast" class="btn-close me-2"></button>
            </div>
        </div>
    </Teleport>
</template>
<style lang="scss">
#main-toast {
    position: fixed;
    bottom: 10px !important;
    left: 8px;
    right: 8px;
    z-index: 9999 !important;
    background: var(--bs-body-bg);
    transition: all .4s ease-in-out;

    &.hide {
        display: none;
    }

    .tst-body {
        height: 50px;
        max-width: 100%;
        width: 400px;
        padding: 10px;
        background: rgba(0,0,0, 0.5);
        color: rgba(255,255, 255, 0.8) !important;
        margin: 0 auto;
    }
}
</style>