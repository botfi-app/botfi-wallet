<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../store/walletStore';
import { useRouter } from 'vue-router';
import MainLayout from './MainLayout.vue';
import Navbar from '../components/header/Navbar.vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    title: { type: String, default: ''},
    pageError: { type: String, default: ''},
    showNav: { type: Boolean, default: false },
    hasNetSelect: { type: Boolean, default: false },
    hasAddrSelect: { type: Boolean, default: false },
    icon: { type: String, default: ''},
    isLoading: { type: Boolean, default: false },
    hasFooter: { type: Boolean, default: false },
    backUrl: {type: null, default: null},
})

const walletStore = useWalletStore()
const router =      useRouter()
const route  =      useRoute()
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
        v-if="initialized"
        :key="route.path"
    >    
        <template v-if="props.showNav">
            <Navbar 
                :title="props.title"
                :hasNetSelect="props.hasNetSelect"
                :hasAddrSelect="props.hasAddrSelect"
                :icon="props.icon"
                :backUrl="props.backUrl"
            />
        </template>

        <template v-if="props.pageError != ''">
            <PageError :text="props.pageError" />  
        </template>

        <template v-else>
            <template v-if="isLoading">
                <div class="center-vh loader-h">
                    <BotFiLoader
                        text="Loading.."
                        size="loader-sm"
                    />
                </div>
            </template>

            <template v-else>
                <slot />
            </template>
        </template>

        <template v-if="hasFooter">
            <BottomNav />
        </template>
    </MainLayout>
</template>
<style>
.addr-btn { padding: 0px !important; }
.loader-h { height: 60vh !important;}
</style>