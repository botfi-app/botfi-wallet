<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
    selected: { type: String, default: "" },
    tabItems: { type: Array, default: []}
})

const tabMain = ref()
const currentTab = ref("")

onMounted(() => {
    nextTick(() => {
        if(props.selected != ''){
            currentTab.value = props.selected
        } else {
            if(props.tabItems.length > 0){
                currentTab.value = props.tabItems[0].contentId;
            }
        }
    });
})

const changeTab = (e) => {
    let t = e.target;
    let contentId = t.dataset.content;
    currentTab.value = contentId
}

watch(currentTab, () => {
    updateTabs()
})


const updateTabs = () => {

    let cTabId = currentTab.value;

    //console.log("cTabId===>", cTabId)

    if(cTabId == '') return;

    //console.log("tabMain.value===>", tabMain.value)

    let tm = tabMain.value
    let contentDom = tm.querySelector('#'+cTabId)

    if(!contentDom) return;

    tm.querySelectorAll(".tab-content > div").forEach((el) => {
        (el == contentDom) 
            ? el.classList.remove("hidden") 
            : el.classList.add("hidden")
    })
}
</script>
<template>
    <div class="tab-main" ref="tabMain">
        <div class="tab-items text-center">
            <template v-for="(item, index) in props.tabItems" :key="index">
                <a  href="#" 
                    :data-content="item.contentId" 
                    @click.prevent="changeTab"
                    :class="`text-center ${(item.contentId == currentTab) ? 'active' : ''}`"
                >
                    {{ item.name }}
                </a>
            </template>
        </div>
        <div class="tab-content">
            <slot />
        </div>
    </div>
</template>