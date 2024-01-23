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
const isFlashOn = ref(false)

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

    camCapabilites.value = null
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
            clearInterval(intval)
        } catch(e) {}

    }, 500)

}

const onClose = async () => {
    stopScan()
    emits("close")
}

const toggleFlash = () => {
    if(html5QrCode == null) return;
    
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
            <div class="menu-area w-full center-vh" v-if="camCapabilites != null">
                <button 
                    v-if="camCapabilites.torchFeature()" 
                    class="btn rounded-lg p-0 torch-btn shadow center-vh"
                    @click.prevent="toggleFlash"
                >
                    <Icon 
                        name="solar:flashlight-bold-duotone"
                        :class="(isFlashOn) ? 'text-primary': 'text-black'"
                    />
                </button>
            </div>
        </template>
    </Modal>
</template>
<style lang="scss">
.menu-area {
   position: absolute;
   left: 0;
   right: 0;
   bottom: 15px;
}
.torch-btn {
   
   z-index: 99;
   width: 42px;
   height: 42px; 
   background: rgba(255, 255, 255, 0.7) !important;
   border-radius: 50%;
}
</style>