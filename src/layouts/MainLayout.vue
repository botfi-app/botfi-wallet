<script setup>
import { useRouter } from 'vue-router';
const props = defineProps({
    showBackBtn: { type: Boolean, default: true },
    title: { type: String, default: "" },
    showNav: { type: Boolean, default: true },
    rightBtn: { type: Object, default: {} }
})


const router = useRouter()
</script>
<template>
    <k-page>
        <k-navbar :title="props.title" centerTitle v-if="showNav">
            <template #left  v-if="props.showBackBtn">
                <k-navbar-back-link text="Back" @click="router.go(-1)" />
            </template>
            <template #right v-if="Object.keys(props.rightBtn).length > 0">
                <k-button 
                    rounded 
                    large 
                    :class="`${props.rightBtn.class || ''} btn mr-2 px-6`"
                    @click.prevent="props.rightBtn.onClick"
                >
                   {{ props.rightBtn.text  }}
                </k-button>
            </template>
        </k-navbar>
        <slot />
        <div class="my-5 text-center">
            BotFi v1.0.0
        </div>
    </k-page>
</template>