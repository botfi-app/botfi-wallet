<script setup>
import { QRCode } from "easyqrcodejs"
import { onMounted, ref } from "vue";
import Utils from "../../classes/Utils"
//import tinycolor from "tinycolor2";

const props = defineProps({
    title: { type: String, required: true },
    address: { type: String, required: true },
    logo: { type: String, required: true }
})

const qrCodeRef = ref()

onMounted(() => {

    //console.log("Utils.getCssVar", Utils.getCssVar("bs-body-bg"))
    //let primaryColor = tinycolor(Utils.getCssVar("bs-primary"))
  

    let opts = {
        text: `${props.address}`,
        width: 260,
        height: 260,
        //colorDark:  Utils.getCssVar("bs-body-bg"), 
		//colorLight: primaryColor.clone().lighten(40).toHexString(),
        quietZone: 5,

        logo: props.logo,

        logoWidth: 45, 
		logoHeight: 45,

        //correctLevel: QRCode.CorrectLevel.H, // L, M, Q, H
        //dotScale: 0.5,
        
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