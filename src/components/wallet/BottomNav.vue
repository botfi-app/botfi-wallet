<script setup>
import { onBeforeMount, ref } from "vue";
import tabItems from "../../config/bottom_nav"
import Icon from "../common/Icon.vue";
import { useRouter, useRoute } from "vue-router"; 

const activeTab = ref(0)
const router = useRouter()
const route  = useRoute()

const isTabActive = (index) => parseInt(index) == parseInt(activeTab.value)

onBeforeMount(() => {
  initialize()
})

const initialize = () => {
   for(let index in tabItems){
      let item = tabItems[index]
      if(route.path == item.url){
         activeTab.value = index
         break;
      }
   }
}

const onTabClick = (item) => {
   router.push(item.url)
}
</script>
<template>
   <div class="bottom-bar" :key="route.path">
      <div class="divider" />
      <div class="b-tabs mt-2 shadow-xl">
         <div class="b-tabs-items">
            <template v-for="(item, index) in tabItems" :key="index">
               <div
                  :class="`b-tab-item text-center ${isTabActive(index) ? 'active': ''}`" 
                  @click.prevent="onTabClick(item)"
               >  
                  <Icon class='rounded-pill icon mb-1' :name="item.icon" :size="20" />
                  <div class="ms-1 fs-12">
                     {{ item.name }}
                  </div>
               </div>
            </template>
         </div>
      </div>
   </div>
</template>