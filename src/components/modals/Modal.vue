<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */
import {  onBeforeUnmount, onMounted, ref } from 'vue';
import { Modal as bsModal } from 'bootstrap'

const $emit = defineEmits(["close", "show", "hide"])

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

    let mElement = modalEl.value;
   
    _modal = new bsModal(mElement)

    mElement.addEventListener("shown.bs.modal", () => {
        $emit("show", mElement, _modal)
    })

    mElement.addEventListener("hidden.bs.modal", () => {
        cleanupModal()
        $emit("hide", mElement, _modal)
    })
}

onBeforeUnmount(async () => {
    if(!_modal) return;
    try{ _modal.hide() } catch(e){}
})

const cleanupModal = () => {
    //let backdrop = document.querySelector(".modal-backdrop")
    //if(backdrop){
     //    backdrop.classList
   // }
    
    //document.body.style = ''
    ///_modal._backdrop.hide()
}
</script>
<template>
   <div class="modal" :id="props.id" ref="modalEl" tabindex="-1">
        <div :class="`modal-dialog ${props.size}`">
            <div class="modal-content">
                <div class="modal-header" v-if="hasHeader">
                    <slot name="header">
                        <div class="w-full d-flex justify-content-between align-items-center">
                            <h5 class="modal-title m-0 p-0" v-html="props.title"></h5>
                            <div class="pe-1">
                                <button 
                                    type="button" 
                                    class="btn-close" 
                                    data-bs-dismiss="modal" 
                                    aria-label="Close"
                                />
                            </div>
                        </div>
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