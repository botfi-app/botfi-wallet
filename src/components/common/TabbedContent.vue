<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import Glide from '@glidejs/glide'

const props = defineProps({
    selected: { type: String, default: "" },
    tabs: { type: Array, default: []}
})

const tabMain = ref()
const currentTab = ref("")

onMounted(() => {
   initialize()
})

const initialize = () => {
    nextTick(() => {
        
        if(props.selected != ''){
            currentTab.value = props.selected
        } else {
            if(props.tabs.length > 0){
                currentTab.value = props.tabs[0].id;
            }
        }
    });
}
</script>
<template>
    <div class="tab-main" ref="tabMain">
        <div class="tab-items text-center">
            <template v-for="(item, index) in props.tabs" :key="index">
                <a  href="#" 
                    :data-tab="item.id"
                    @click.prevent="currentTab=item.id"
                    :class="`text-center ${(item.id == currentTab) ? 'active' : ''}`"
                >
                    {{ item.name }}
                </a>
            </template>
        </div>
        <div class="tab-content">
            <template v-for="(item, index) in props.tabs" :key="index">
                <div :data-tab="item.id" :class="currentTab != item.id ? 'hidden': ''">
                    <component 
                        :is="item.component"  
                        v-bind="{...item.componentAttrs || {}}" 
                    />
                </div>
            </template>
        </div>
    </div>
</template>