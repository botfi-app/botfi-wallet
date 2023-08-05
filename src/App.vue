<script setup>
  import { onMounted } from "vue";
import AlertDialog from "./components/common/AlertDialog.vue";
</script>

<template>
  <k-app theme="material" safe-areas>
    <router-view v-slot="{ Component, route }">
      <transition  
        mode="out-in"
        enter-active-class="animate__animated animate__zoomIn animate__faster"
        leave-active-class="animate__animated animate__zoomOut animate__faster"
      >
        <component :is="Component" :key="route.path"  />
      </transition>
    </router-view>
    <alert-dialog />
  </k-app>
</template>
