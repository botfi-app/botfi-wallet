<script setup>
import { onMounted, provide, ref } from "vue";
import BotFiProvider from "./layouts/BotFiProvider.vue";
import Toast from "./components/Toast.vue";

//leave-active-class="animate__animated animate__zoomOut animate__fastest"
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