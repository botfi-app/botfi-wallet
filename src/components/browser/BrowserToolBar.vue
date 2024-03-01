<script setup>
import { ref, watch } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import Avatar from '../common/avatar.vue';
import Utils from '../../classes/Utils';

const p = defineProps({
    canGoBack: { type: Boolean, default: false }, 
    canGoForward: { type: Boolean, default: false },
    totalTabs: { type: Number, default: 0 },
})

const walletStore = useWalletStore()
const emits = defineEmits(["goBack", "goForward"])

const canGoBack = ref(p.canGoBack)
const canGoForward = ref(p.canGoForward)

const emitEvt = (evt) => emits(evt)

watch(p, () => {
    canGoBack.value     = p.canGoBack
    canGoForward.value  = p.canGoForward
}, { deep: true });

</script>
<template>
    <div id="browser-toolbar" class="d-flex align-items-center justify-content-between">
        
        <button @click.prevent="$router.push('/wallet')" 
            class="btn btn-none mx-1 text-primary"
        >
            <Icon name="mdi:wallet-outline" class="icon" :size="28" style="opacity: 1;" />
        </button>
    
        <button   @click.prevent="emitEvt('goBack')"
            :class="`btn btn-none mx-1 ${canGoBack ? '': 'disabled'}`"
        >
            <Icon name="ic:round-arrow-back" class="icon" :size="28" />
        </button>
        <button  @click.prevent="emitEvt('goFoward')"
            :class="`btn btn-none mx-1 ${canGoForward ? '': 'disabled'}`"
        >
            <Icon name="ic:round-arrow-forward" class="icon" :size="28" />
        </button>

        
        <router-link to="/browser/tabs"
            class="btn rounded py-0 px-2 fs-12 center-vh fs-14 tabs-btn"
        >
            {{ p.totalTabs }}
        </router-link>

        <div class="pe-3" v-if="walletStore.activeWallet">
            <router-link to="/wallet/addresses?r=/browser&returnOnSelect"
                :class="`btn text-truncate fs-14 acct-select-btn ms-1 px-2 center-vh rounded-pill`"
            >
                <Avatar 
                    :name="walletStore.activeWallet.address" 
                    :square="false" 
                    :size="28" 
                    variant="ring"
                    class="rounded"
                    :key="walletStore.activeWallet.address"
                />
                <div class="ms-1">
                    {{ Utils.maskAddress(walletStore.activeWallet.address, 2, 4) }}
                </div>
            </router-link>
        </div>
    </div>
</template>
<style scoped lang="scss">
#browser-toolbar {
    height: 60px;
    background: var(--bs-body-bg-dark-5);

    .tabs-btn {
        height: 27px;
        border: 2px solid var(--bs-body-color) !important;
        opacity: 0.6;
    }

    .btn {

        border: none;

        .icon { opacity: 0.6;}

        &.disabled {
            .icon { opacity: 0.2;}
        }
    }

    .acct-select-btn {
        background:var(--bs-body-bg);
    }
}
</style>