<script setup>
import Utils from '../../classes/Utils';

const props = defineProps({
    text: { type: String, default: Utils.generalErrorMsg },
    hasImage: { type: Boolean, default: true },
    hasTitle: { type: Boolean, default: true },
    textClass: { type: String, default: '' },
    canRetry: { type: Boolean, default: true }
})

const emits = defineEmits(["retry"])

const onRetry = () => {
    emits("retry")
}
</script>
<template>
    <div class="inline_page_error d-flex w-full justify-content-center">
        <div class="d-flex flex-column align-items-center">
            <img 
                loading="lazy" 
                src="/images/svg/cross.svg"
                alt=""
                v-if="props.hasImage"
                class="my-3"
            />
            <h1 v-if="props.hasTitle"
                class="fw-bold fs-1 text-danger mb-2 text-center"
            >
                Oops!
            </h1>
            <div  style="--bs-text-opacity: .5;"
                :class="`text-center fs-14 text-dark-emphasis px-4 ${props.textClass} text-capitalize`"
            >
                {{ props.text.replace("_", " ") }}
        </div>
            <div class="mt-2 d-flex w-full justify-content-center">
                <button @click.prevent="onRetry"
                    class="btn btn-info btn-sm rounded-pill px-5 center-vh"
                    v-if="props.canRetry"
                >
                    <Icon name="ant-design:reload-outlined" :size="18" />
                    <div class="ms-2">Retry</div>
                </button>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.inline_page_error{
    img {
        width: 128px;
    }
}
</style>