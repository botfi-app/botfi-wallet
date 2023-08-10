<script setup>
import { onMounted, provide, ref } from "vue";
import BotFiProvider from "./layouts/BotFiProvider.vue";

//leave-active-class="animate__animated animate__zoomOut animate__fastest"
</script>

<template>
  <k-app theme="material" safe-areas>
      <router-view v-slot="{ Component, route }">
        <transition  
          name="custom-classes"
          enter-active-class="animate__animated animate__zoomIn animate__fastest"
        >
          <component :is="Component" :key="route.path"  />
        </transition>
      </router-view>

      <toast />
  </k-app>
</template>

<style scoped>
.animate__fastest {
  -webkit-animation-duration: 200ms;
  animation-duration: 200ms;
}
</style>