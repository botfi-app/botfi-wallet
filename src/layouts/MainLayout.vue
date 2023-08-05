<script setup>
import { useRouter } from 'vue-router';
const props = defineProps({
    showBackBtn: { type: Boolean, default: true },
    title: { type: String, default: "" },
    showNav: { type: Boolean, default: true }
})


const router = useRouter()
</script>
<template>
    <k-page>
        <k-navbar :title="props.title" centerTitle v-if="showNav">
            <template #left  v-if="props.showBackBtn">
                <k-navbar-back-link text="Back" @click="router.go(-1)" />
            </template>
        </k-navbar>
        <slot />
        <div class="my-5 text-center">
            BotFi v1.0.0
        </div>
    </k-page>
</template>