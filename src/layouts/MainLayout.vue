<script setup>
import { onBeforeMount, watch, inject, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/header/Navbar.vue';
import EventBus from '../classes/EventBus';

const botUtils = inject("botUtils")

const props = defineProps({
    title: { type: String, default: "" },
    showBackBtn: { type: Boolean, default: false },
    onBackBtnClick: { type: Function, default: null },
    centerContent:  { type: Boolean, default: false }
})

const appMain        = ref()
const appContent     = ref()
const hasNativeNav   = ref(false)
const initialized    = ref(false)

onBeforeMount(() => {
    initialize()
})

const initialize = () => {

    let p = botUtils.platform()
    hasNativeNav.value = (!(p=='' || p == 'unknown'))
    
    EventBus.on("app_expanded", () =>  {
        computeAppHeight()
    })

    initialized.value = true
}

onMounted(() => {
    computeAppHeight()
})

const computeAppHeight = () => {

    let height = botUtils.getViewportHeight()
    
    let appm = appMain.value
    appm.style.height = height + 'px'

    let expanded = botUtils.isExpanded()
    let cl = appm.classList;

    (expanded) ? cl.add("expanded") : cl.remove("expanded")
    
    document.documentElement.dataset.isExpanded = expanded
}

</script>
<template>
    <div class="app-main" ref="appMain">
        <Navbar 
            v-if="!hasNativeNav" 
            :title="props.title"
            :has-back-btn="props.showBackBtn"  
            :on-back-btn-click="props.onBackBtnClick"
        />
        <div :class="`app-content ${props.centerContent ? 'center-content' : ''}`" 
            ref="appContent"
        >
            <slot />
        </div>
    </div>
</template>