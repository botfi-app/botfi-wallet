<script setup>
import TabbedContent from "../common/TabbedContent.vue"
import ERC20TokensTab from "./tabs/ERC20TokensTab.vue";
import NFTsTab from "./tabs/NFTsTab.vue";

const props = defineProps({
    limit: { type: null, default: null }
})
</script>
<template>
    
    <TabbedContent
        :tab-items="[
            {contentId: 't-erc20s', name: 'Tokens'},
            {contentId: 't-nfts', name: 'NFTs'},
            {contentId: 't-activity', name: 'Activity'}
        ]"
    >
        <div id="t-erc20s" class="mt-1">
            <ERC20TokensTab :limit="props.limit" />
        </div>
        <div id="t-nfts">
            <NFTsTab :limit="props.limit" />
        </div>
        <div id="t-activity">

        </div>
    </TabbedContent>
</template>