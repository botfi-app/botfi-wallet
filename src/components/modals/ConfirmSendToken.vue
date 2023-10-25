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

</script>
<template>
    <Modal
        id="deposit-addr-modal"
        :title="props.title"
        :has-header="true"
        :has-footer="false"
    >
        <template #body>


        </template>
    </Modal>

</template>