<script setup>
import { onMounted, ref } from 'vue';
import MicroModal from 'micromodal';  // es6 module

const $emit = defineEmits(["close", "show"])

const props = defineProps({
    id:       { type: String, required: true },
    title:    { type: String, default: ""},
})

//const bs = document.body.style

onMounted(() => {
    setTimeout(() => initModal(), 1000)
})

const initModal = () => {
    MicroModal.init({
       // disableScroll: true,
        onShow: m => {
            $emit("show", m)
        },
        onClose: m => { 
            $emit("close", m)
        }
    })
}
</script>
<template>
    <div class="m_modal micromodal-slide w-full px-0" :id="props.id" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
            <div :class="`modal__container shadow-lg w-full px-0 ${props.size}`" 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="modal-1-title"
            >
                <header class="modal__header">
                    <h2 class="modal__title" id="modal-1-title">
                        {{ props.title }}
                    </h2>
                    <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                </header>
                <main data-simplebar
                    class="modal__content w-full" 
                >
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>