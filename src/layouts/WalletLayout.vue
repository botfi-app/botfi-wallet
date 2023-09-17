<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../store/walletStore';
import { useRouter } from 'vue-router';
import MainLayout from './MainLayout.vue';
import Navbar from '../components/header/Navbar.vue';


const props = defineProps({
    title: { type: String, default: ''},
    pageError: { type: String, default: ''},
    showNav: { type: Boolean, default: false },
    hasNetSelect: { type: Boolean, default: false },
    hasAddrSelect: { type: Boolean, default: false },
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
        :title="props.title"
        :page-error="props.pageError"
        v-if="initialized"
    >    
        <div v-if="props.showNav">
            <Navbar 
                :title="props.title"
                :hasNetSelect="props.hasNetSelect"
                :hasAddrSelect="props.hasAddrSelect"
            />
        </div>
        
        <slot />
    </MainLayout>
</template>
<style>
.addr-btn { padding: 0px !important; }
</style>