<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import MicroModal from 'micromodal';  // es6 module

const $emit = defineEmits(["close", "show"])

const props = defineProps({
    id:       { type: String, required: true },
    title:    { type: String, default: ""},
    maxHeight:   { type: String, default: "" },
    hasHeader: { type: Boolean, default: true }
})

//const bs = document.body.style

const styles = ref({})

onBeforeMount(() => {
    if(props.maxHeight.trim() != ''){
        styles.value['max-height'] = props.maxHeight
    }
})

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
                :style="styles"
            >
                <header class="modal__header" v-if="props.hasHeader">
                    <h2 class="modal__title" id="modal-1-title">
                        {{ props.title }}
                    </h2>
                    <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                </header>
                <main 
                    class="modal__content w-full" 
                >
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>