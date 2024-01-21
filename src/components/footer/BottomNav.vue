<script setup>
import { onBeforeMount, ref } from "vue";
import tabItems from "../../config/bottom_nav"
import Icon from "../common/Icon.vue";
import { useRouter, useRoute } from "vue-router"; 
import Utils from "../../classes/Utils";

const activeTab = ref(0)
const router = useRouter()
const route  = useRoute()

const emit = defineEmits(["change"])

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

const onTabClick = (index) => {
   activeTab.value = index
   ///emit("change", tabItems[index].name.toLowerCase())
   router.push( tabItems[index].url )
}
</script>
<template>
   <div class="bottom-bar-main">
      <div class="bottom-bar" :key="route.path">
         <div class="divider" />
         <div class="b-tabs mt-2 shadow-xl">
            <div class="b-tabs-items">
               <template v-for="(item, index) in tabItems" :key="index">
                  <div
                     :to="item.url"
                     :class="`b-tab-item text-center ${isTabActive(index) ? 'active': ''}`" 
                     rel="prefetch"
                     @click.prevent="onTabClick(index)"
                     v-if="'platforms' in item && 
                        (item.platforms.includes('all') || item.platforms.includes(Utils.appPlatform()))
                     "
                  >  
                     <Icon class='rounded-pill icon mb-1 icon' 
                        :name="item.icon" 
                        :size="20" 
                     />
                     <div class="ms-1 fs-11">
                        {{ item.name }}
                     </div>
                  </div>
               </template>
            </div>
         </div>
      </div>
   </div>
</template>
<style lang="scss" scoped>
.bottom-bar-main {
   padding-bottom: 75px;
}

.icon { padding: 2px; }

.b-tab-item {
   opacity: 0.4;

   &.active {
      opacity: 0.9;
   }
}
</style>