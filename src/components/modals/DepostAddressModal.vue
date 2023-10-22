<script setup>
import { QRCode } from "easyqrcodejs"
import { onMounted, ref } from "vue";
import Utils from "../../classes/Utils"
import tinycolor from "tinycolor2";

const props = defineProps({
    title: { type: String, required: true },
    address: { type: String, required: true },
    logo: { type: String, required: true }
})

const qrCodeRef = ref()

onMounted(() => {

    //console.log("Utils.getCssVar", Utils.getCssVar("bs-body-bg"))
    let primaryColor = tinycolor(Utils.getCssVar("bs-primary"))
    let colorSuccess = tinycolor(Utils.getCssVar("bs-success"))
    let colorWarning = tinycolor(Utils.getCssVar("bs-warning"))
    let colorInfo = tinycolor(Utils.getCssVar("bs-info"))

    let opts = {
        text: `ethereum:${props.address}`,
        width: 200,
        height: 200,
        colorDark:  Utils.getCssVar("bs-body-bg"), 
		colorLight: primaryColor.clone().lighten(40).toHexString(),
        quietZone: 5,

        logo: props.logo,

        logoWidth: 45, 
		logoHeight: 45,

        PO: colorWarning.clone().darken(8).toHexString(), 
        PI: colorWarning.clone().darken(20).toHexString(), 

        PO_TL: primaryColor.clone().toHexString(), // Position Outer - Top Left 
        PI_TL: primaryColor.clone().darken(20).toHexString(), // Position Inner - Top Left 
       
        PO_TR: colorSuccess.clone().toHexString(), // Position Outer - Top Right 
        PI_TR: colorSuccess.clone().darken(20).toHexString(), // Position Inner - Top Right 

        AI: colorInfo.clone().darken(15).toHexString(),
        AO: colorInfo.clone().toHexString(),

        //correctLevel: QRCode.CorrectLevel.H, // L, M, Q, H
        dotScale: 0.8,
        
    }

    window.setTimeout(()=>{
        let qrcode = new QRCode(qrCodeRef.value, opts);
    }, 100)
})
</script>
<template>
    <Modal
        id="deposit-addr-modal"
        :title="props.title"
        :has-header="true"
        :has-footer="false"
    >
        <template #body>
            <div class="py-4">
                <div class="w-full center-vh mb-4">
                    <div class="desposit-addr-qr">
                        <div ref="qrCodeRef"></div>
                    </div>
                </div>
                <div class="px-4">
                    <div class="deposit-addr-area p-2 rounded-lg">
                        <div class="flex-1 px-1 fs-14 fw-semibold">
                            {{ props.address }}
                        </div> 
                        <CopyBtn 
                            :text="props.address" 
                            btnClasses="btn copy-btn btn-danger p-0 px-1 rounded m-1"
                        />
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>
<style lang="scss">
.desposit-addr-qr {
    canvas{
        border-radius: 8px !important;
        overflow: hidden !important;
        display: block;
    }
}
.deposit-addr-area{
    background: var(--bs-body-bg-dark-10);
    display:flex; 
    justify-content: center;
    align-items: center;
    
    .copy-btn {
        width: 32px;
    }

    > div {
        word-wrap: break-word !important;
        width: calc(100% - 35px);
    }
    
}
</style>