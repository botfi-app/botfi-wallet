<script setup>
import { onBeforeMount, ref } from 'vue';

const props = defineProps({
    selected: { type: String, default: "" },
    tabs: { type: Array, default: []}
})

const tabMain = ref()
const currentTabIndex = ref(0)

onBeforeMount(() => {
   initialize()
})

const initialize = () => {
    if(props.selected != ''){
        props.tabs.forEach((item, index) => {
            if(item.id == props.selected) { currentTabIndex.value = index }
        })
    }
}
</script>
<template>
    <div class="tab-main" ref="tabMain">
        <div class="tab-items text-center">
            <template v-for="(item, index) in props.tabs" :key="index">
                <a  href="#" 
                    :data-tab="item.id"
                    @click.prevent="currentTabIndex=index"
                    :class="`text-center ${(currentTabIndex == index) ? 'active' : ''}`"
                >
                    {{ item.name }}
                </a>
            </template>
        </div>
        <div class="tab-content mt-1">
            <template v-for="(item, index) in props.tabs" :key="index">
                <div :data-tab="item.id" :class="currentTabIndex != index ? 'hidden': ''">
                    <component 
                        :is="item.component"  
                        v-bind="{...item.componentAttrs || {}}" 
                    />
                </div>
            </template>
        </div>
    </div>
</template>