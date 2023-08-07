<script setup>
import { provide, ref } from 'vue';
import AlertDialog from '../components/common/AlertDialog.vue';

const alertInfo = ref({ opened: false, message: ""})
const loaderInfo = ref({ opened: false, message: "", canClose: true })

const alertDialog = {
    open: (message) => alertInfo.value = { opened: true, message},
    close: () => alertInfo.value = { opened: false, message: ""},
    update: (message) => alertInfo.value = { opened: true, message}
}

const loaderDialog = {
    show: ( message, canClose = true ) => {
        loaderInfo.value = { opened: true, message, canClose }
    },

    hide: () => {
        loaderInfo.value = { opened: false, message: "", canClose: true }
    },

    update: ( message, canClose = true ) => {
        loaderInfo.value = { opened: true, message, canClose }
    }
}

provide("alertDialog", alertDialog)
provide("loaderDialog", loaderDialog)
</script>
<template>
    <div>
        <slot />
        <AlertDialog 
            :opened="alertInfo.opened" 
            :key="alertInfo.opened"
            :message="alertInfo.message"
            @close="alertInfo.opened=false"
        />
        <loading-dialog 
            :opened="loaderInfo.opened" 
            :message="loaderInfo.message"
            :canClose="loaderInfo.canClose"
            @hide="loaderInfo.hide=false"
        />
        <toast />
    </div>
</template> 