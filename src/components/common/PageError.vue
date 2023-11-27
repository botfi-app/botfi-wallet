<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Utils from '../../classes/Utils';
import { useRouter } from 'vue-router'

const props = defineProps({
    text: { type: String, default: Utils.generalErrorMsg }
})

const router = useRouter()
</script>
<template>
    <div class="page_error d-flex w-full h-full justify-content-center">
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
                class=" fs-5 text-center text-dark-emphasis px-4"
            >
                {{ props.text }}
            </h5>
            <div class="mt-3 d-flex w-full justify-content-center">
                <button @click="router.go(-1)"
                    class="btn btn-primary rounded-pill px-3 center-vh"
                >
                    <Icon name="ion:arrow-back-sharp" :size="18" />
                    <div class="ms-2">Back</div>
                </button>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.page_error{
    height: 100vh !important;
    padding-top: 40px;
    img {
        height: 120px;
        max-width: 95%;
    }
}
</style>