<script setup>
import { inject, onBeforeMount, onMounted, ref } from 'vue';
import {Html5QrcodeScanner, Html5Qrcode} from "html5-qrcode";
import { Modal as bsModal } from 'bootstrap';

const p = defineProps({
    title: { type: String, default: 'Scan QRCode' }
})

const emits = defineEmits(['close', 'success', 'error'])

const botUtils = inject("botUtils")
const nativeQRCodeReader = ref(null)
const nativeQRCodeReaderSupported = ref(false)
let html5QrCode = null

const camCapabilites = ref(null)
const config = { fps: 10, qrbox: {width: 250, height: 250} }


onBeforeMount(() => {
    nativeQRCodeReader.value = botUtils.qrCodeReader()
    nativeQRCodeReaderSupported.value = nativeQRCodeReader.value.isSupported()
})

onMounted(async () => {
    html5QrCode = new Html5Qrcode("qrCodeReader");
})

const stopScan = async () => {
    if(html5QrCode == null) return;
    try{ 

        let state = html5QrCode.getState()

        if(state != 'NOT_STARTED'){
            html5QrCode.stop() 
        }
        
    } catch(e){}
}

const onScanSuccess = (decodedText, decodedResult) => {
   emits("success", decodedText)
   stopScan()
   bsModal.getInstance("#qrcode_reader_modal").hide()
}


const onShow = () => {
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess);

    let intval = setInterval(async () => {
        if(camCapabilites.value != null){
            clearInterval(intval)
            return;
        }

        try{
            camCapabilites.value = html5QrCode.getRunningTrackCameraCapabilities()
        } catch(e) {}
        
    }, 500)

}

const onClose = async () => {
    stopScan()
    emits("close")
}
</script>
<template>
    <Modal
        id="qrcode_reader_modal"
        :title="p.title"
        :has-header="true"
        :has-footer="false"
        @show="onShow"
        @hide="onClose"
        size="modal-lg"
    >
        <template #body>
            <div>
                <div id="qrCodeReader"></div>
            </div>
            <div class="menu-area p-2">
                
            </div>
        </template>
    </Modal>
</template>
<style lang="scss">
.menu-area {
    background: var(--bg-dark-2);
}
</style>