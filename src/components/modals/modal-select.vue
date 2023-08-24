<script setup>
import { onMounted } from 'vue';
import MicroModal from 'micromodal';  // es6 module

const props = defineProps({
    id: { type: String, default: 'select-modal' },
    title: { type: String, default: ""},
    options: { type: Array, default: []},
    selected: { type: String, default: "" }
})

const $emits = defineEmits(["close"])

onMounted(() => {
    setTimeout(() => initModal(), 1000)
})

const initModal = () => {
    /*MicroModal.init({
        onClose: modal =>  $emits("close"), 
    })*/

   // MicroModal.show("select-modal")
}

</script>

<template>
   <div class="m_modal micromodal-slide" :id="props.id" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
            <div class="modal__container shadow-lg" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                <header class="modal__header">
                    <h2 class="modal__title" id="modal-1-title">
                        {{ props.title }}
                    </h2>
                    <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                </header>
                <main class="modal__content" id="modal-1-content">
                    <p>
                        Try hitting the <code>tab</code> key and notice how the focus stays within the modal itself. Also, <code>esc</code> to close modal.
                    </p>
                </main>
            </div>
        </div>
    </div>
      
</template>
