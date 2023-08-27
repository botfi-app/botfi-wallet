<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../store/walletStore';
import { useRouter } from 'vue-router';
import MainLayout from './MainLayout.vue';


const props = defineProps({
    title: { type: String, default: ''},
    pageError: { type: String, default: ''},
})

const walletStore = useWalletStore()
const router = useRouter()
const initialized = ref(false)


onBeforeMount(() => {

    if(!walletStore.isLoggedIn()){
        return router.push("/login")
    }

    initialized.value = true
})

</script>
<template>
    <MainLayout 
        :has-back-btn="false"
        :title="props.title"
        :page-error="props.pageError"
        v-if="initialized"
    >    
        <slot />
    </MainLayout>
</template>
<style>
.addr-btn { padding: 0px !important; }
</style>