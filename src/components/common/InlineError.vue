<script setup>
import Utils from '../../classes/Utils';

const props = defineProps({
    text: { type: String, default: Utils.generalErrorMsg }
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
                src="/images/svg/page_error.svg"
                alt=""
            />
            <h1 class="fw-bold fs-1 mt-3 text-danger my-2 text-center">
                Oops!
            </h1>
            <h5  style="--bs-text-opacity: .5;"
                class="text-center text-dark-emphasis px-4"
            >
                {{ props.text }}
            </h5>
            <div class="mt-2 d-flex w-full justify-content-center">
                <button @click.prevent="onRetry"
                    class="btn btn-info rounded-pill px-5 center-vh"
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
    padding: 20px 0px;
    img {
        height: 160px;
        max-width: 95%;
    }
}
</style>