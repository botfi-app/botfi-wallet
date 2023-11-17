<script setup>
import { useWalletStore } from './store/walletStore';
import { useTokens } from './composables/useTokens';
import { onBeforeMount, toValue, watch, ref } from 'vue';
import EventBus from './classes/EventBus';
import { useRouter } from 'vue-router';

const walletStore = useWalletStore()
const tokensCore = useTokens()

const isUpdatingBalance = ref(false); 
const router = useRouter()

onBeforeMount(() => {
  
  updateBalances()
  setInterval(updateBalances, 30_000);

  EventBus.on("login", () => updateBalances())
  EventBus.on("update-balance",  () => updateBalances())

})


const updateBalances = async() => {
  
  if(!walletStore.isLoggedIn() || isUpdatingBalance.value == true) return;
  
  isUpdatingBalance.value = true 

  let addresses = await walletStore.getWalletAddresses()

  let updateStatus = await tokensCore.updateBalances(addresses)

  //console.log("updateStatus==>", updateStatus)

  isUpdatingBalance.value = false
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