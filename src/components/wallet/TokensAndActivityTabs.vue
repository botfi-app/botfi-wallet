<script setup>
import { onBeforeMount, ref } from "vue";
import TabbedContent from "../common/TabbedContent.vue"
import ERC20TokensTab from "./tabs/ERC20TokensTab.vue";
import NFTsTab from "./tabs/NFTsTab.vue";
import { useRoute } from "vue-router";

const props = defineProps({
    limit: { type: null, default: null },
    enableViewAllBtn: { type: Boolean, default: false }
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
        :tab-items="[
            {contentId: 'tab-tokens', name: 'Tokens'},
            {contentId: 'tab-nfts', name: 'NFTs'},
            {contentId: 'tab-activity', name: 'Activity'}
        ]"
    >
        <div id="tab-tokens" class="mt-1">
            <ERC20TokensTab 
                :limit="props.limit" 
                :enableViewAllBtn="props.enableViewAllBtn"
            />
        </div>
        <div id="tab-nfts">
            <NFTsTab 
                :limit="props.limit"
                :enableViewAllBtn="props.enableViewAllBtn"
            />
        </div>
        <div id="tab-activity">

        </div>
    </TabbedContent>
  
</template>