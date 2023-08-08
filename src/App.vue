<script setup>
import { onMounted, provide, ref } from "vue";
import BotFiProvider from "./layouts/BotFiProvider.vue";

</script>

<template>
  <k-app theme="material" safe-areas>
    <BotFiProvider>
      <router-view v-slot="{ Component, route }">
        <transition  
          mode="out-in"
          enter-active-class="animate__animated animate__zoomIn animate__fastest"
          leave-active-class="animate__animated animate__zoomOut animate__fastest"
        >
          <component :is="Component" :key="route.path"  />
        </transition>
      </router-view>
    </BotFiProvider>
  </k-app>
</template>

<style scoped>
.animate__fastest {
  -webkit-animation-duration: 200ms;
  animation-duration: 200ms;
}
</style>