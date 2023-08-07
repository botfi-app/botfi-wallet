<script setup>
import { provide, ref } from 'vue';
import AlertDialog from '../components/common/AlertDialog.vue';

const alertInfo = ref({ opened: false, message: "", onClose: null })
const loaderInfo = ref({ opened: false, message: "", canClose: true })

const alertDialog = {
    open: (message, onClose = null) =>{
        
        let handleOnClose = async () => {
            alertInfo.value = { ...alertInfo.value, opened: false } 
            if(onClose && typeof onClose === 'function'){
                onClose()
            }
        }

        alertInfo.value = { opened: true, message, handleOnClose }
    },
    
    close: () => alertInfo.value = { opened: false, message: ""},
    update: (message, onClose = null) => alertInfo.value = { opened: true, message, onClose}
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
            @close="alertInfo.onCloseHandler"
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