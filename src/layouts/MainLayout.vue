<script setup>
import { onBeforeMount, watch, inject, ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/header/Navbar.vue';
import EventBus from '../classes/EventBus';

const botUtils = inject("botUtils")

const props = defineProps({
    title: { type: String, default: "" },
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
    nextTick(()=> {
        let height = botUtils.getViewportHeight()
        
        let expanded = botUtils.isExpanded()

        let appm = document.querySelector(".app-main")
        
        if(appm){
            appm.style.height = height + 'px'
            let cl = appm.classList;
            (expanded) ? cl.add("expanded") : cl.remove("expanded")
        }

        document.documentElement.dataset.isExpanded = expanded
    })
}

</script>
<template>
    <div class="app-main" ref="appMain">
        <div :class="`app-content ${props.centerContent ? 'center-content' : ''}`" 
            ref="appContent"
        >
            <slot />
        </div>
    </div>
</template>