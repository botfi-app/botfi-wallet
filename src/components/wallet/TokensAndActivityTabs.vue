<script setup>
import { onBeforeMount, ref } from "vue";
import TabbedContent from "../common/TabbedContent.vue"
import ERC20TokensTab from "./tabs/ERC20TokensTab.vue";
import NFTsTab from "./tabs/NFTsTab.vue";
import ActivityTab from "./tabs/ActivityTab.vue";

import { useRoute } from "vue-router";

const props = defineProps({
    limit: { type: null, default: null },
    enableViewAllBtn: { type: Boolean, default: false }
})

const componentAttrs = ref({ 
})

const route = useRoute()
const selectedTab = ref("")

onBeforeMount(() => {

    let hash = (route.hash || "").trim()

    if(hash != ""){
        hash = hash.replace(/^#/g, "").trim()
        selectedTab.value = hash
    }
})
</script>
<template>
    
    <TabbedContent
        :selected="selectedTab"
        :tabs="[
            { 
              id:   'tab-tokens',  
              name: 'Tokens',
              component: ERC20TokensTab, 
              componentAttrs
            },
            {   
                id: 'tab-nfts',
                name: 'NFTs',
                component: NFTsTab, 
                componentAttrs
            },
            {
                id:   'tab-activity',
                name: 'Activity',
                component: ActivityTab, 
                componentAttrs
            }
        ]"
    />
    
</template>