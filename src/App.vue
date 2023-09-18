<script setup>
import { useWalletStore } from './store/walletStore';
import { useTokens } from './composables/useTokens';
import { onBeforeMount, toValue, watch } from 'vue';
import EventBus from './classes/EventBus';

const walletStore = useWalletStore()
const tokensCore = useTokens()

let isUpdatingBalance = false; 

onBeforeMount(() => {
  
  updateBalances()
  setInterval(updateBalances, 30_000);

  EventBus.on("login", () => updateBalances())
  EventBus.on("update-balance",  () => updateBalances())

})

const updateBalances = async() => {
  
  if(!walletStore.isLoggedIn() || isUpdatingBalance) return;
  
  let addresses = await walletStore.getWalletAddresses()

  await tokensCore.updateBalances(addresses)

  isUpdatingBalance = false
}

</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition  
      name="custom-classes"
      enter-active-class="animate__animated animate__zoomIn animate__fastest"
    >
      <component :is="Component" :key="route.path"  />
    </transition>
  </router-view>
  
  <toast />
</template>

<style scoped>
.animate__fastest {
  -webkit-animation-duration: 200ms;
  animation-duration: 200ms;
}
</style>