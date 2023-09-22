<script setup>

import { onBeforeMount, ref } from 'vue'
import Icon from '../../components/common/Icon.vue';
import { useSettings } from "../../composables/useSettings"

const { settings } = useSettings()

</script>
<template>
    <WalletLayout
        title="Settings"
        :showNav="true"
        :hasNetSelect="false"
        :hasAddrSelect="false"
        icon="basil:settings-solid"
    >   

        <NativeBackBtn url="/wallet" />
        
        <div class="w-400 mb-5">
            <div class="mt-3"> 
                <div class="h-divided" />           
                <nav class="list-group list-group-flush">
                    <router-link to="/settings/fiat-currencies" 
                        class="list-group-item fw-semibold py-3"
                    >
                        <div class="d-flex justify-content-between ">
                            <div>Default Fiat Currency</div>
                            <div class="d-flex align-items-center">
                                <span class="me-2 text-primary">
                                    {{ (settings.defaultCurrency || "USD").toUpperCase() }}
                                </span>
                                <Icon name="ph:coin-vertical-duotone" :size="24" />
                            </div>
                        </div>
                    </router-link>
                    <a class="list-group-item fw-semibold py-3">
                        <div class="d-flex justify-content-between ">
                            <div>Reveal Seed Phrase</div>
                            <Icon name="solar:password-minimalistic-input-bold-duotone" :size="24" />
                        </div>
                    </a>
                    <a class="list-group-item fw-semibold py-3">
                        <div class="d-flex justify-content-between ">
                            <div>Network Settings</div>
                            <Icon name="ic:twotone-network-wifi-2-bar" :size="24" />
                        </div>
                    </a>
                    <a class="list-group-item fw-semibold py-3">
                        <div class="d-flex justify-content-between ">
                            <div>Account Settings</div>
                            <Icon name="solar:user-bold-duotone" :size="24" />
                        </div>
                    </a>
                </nav>
            </div>
        </div>

        <BottomNav />
    </WalletLayout>
</template>