<script setup>
import { ref } from "vue";
import tabbar from "../config/tabbar"
import Icon from "../components/common/Icon.vue";

const activeTab = ref(0)

const isActivaTab = (index) => (index == activeTab.value)

</script>
<template>
    <k-tabbar
      :labels="true"
      :icons="true"
      class="left-0 bottom-0 fixed"
    >
      <template v-for="(item, index) in tabbar" :key="index">
        <k-tabbar-link
          :data-index="index"
          :active="isActivaTab(index)"
        >
          <template #label> {{ item.title }} </template>
          <template #icon>
            <k-icon>
              <Icon :name="item.icon" :size="24" />
            </k-icon>
          </template>
        </k-tabbar-link>
      </template>
    </k-tabbar>
</template>