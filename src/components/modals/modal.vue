<script setup>
import {  onBeforeUnmount, onMounted, ref } from 'vue';
import { Modal } from 'bootstrap'

const $emit = defineEmits(["close", "show"])

const props = defineProps({
    id:       { type: String, required: true },
    title:    { type: String, default: ""},
    hasHeader: { type: Boolean, default: true },
    hasFooter: { type: Boolean, default: true },
    size: { type: String, default: '' }
})

let _modal = null
let modalEl = ref()

onMounted(() => {
    setTimeout(() => initModal(), 200)
})

const initModal = () => {

    let mEl = modalEl.value;

   _modal = new Modal(mEl)

    mEl.addEventListener("hidden.bs.modal", () => {
        cleanupModal()
    })
}

onBeforeUnmount(async () => {
    _modal.hide()
    cleanupModal()
})

const cleanupModal = () => {
    let backdrop = document.querySelector(".modal-backdrop")
    if(backdrop) backdrop.remove()
    document.body.style = ''
    _modal._backdrop.hide()
}
</script>
<template>
   <div class="modal" :id="props.id" ref="modalEl" tabindex="-1">
        <div :class="`modal-dialog ${props.size}`">
            <div class="modal-content">
                <div class="modal-header" v-if="hasHeader">
                    <slot name="header">
                        <h5 class="modal-title" v-html="props.title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </slot>
                </div>
                <div class="modal-body p-0">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer" v-if="hasFooter">
                    <slot name="footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>