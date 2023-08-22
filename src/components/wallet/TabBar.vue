<script setup>
import { ref } from "vue";
import tabbar from "../../config/tabbar"
import Icon from "../common/Icon.vue";

const activeTab = ref(0)

const isActivaTab = (index) => (index == activeTab.value)

</script>
<template>
   
</template>