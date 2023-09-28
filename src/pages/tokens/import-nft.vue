<script setup>
import { ref } from 'vue';
import TabbedContent from '../../components/common/TabbedContent.vue';
import ImportNFTBySearch from '../../components/tokens/import-nft/ImportNFTBySearch.vue';
import ImportNFTByContract from '../../components/tokens/import-nft/ImportNFTByContract.vue';

</script>
<template>
    <WalletLayout
        title="Import NFT"
        :showNav="true"
        :hasNetSelect="true"
        :hasAddrSelect="false"
    >   

        <NativeBackBtn 
            url="/tokens"
        />

        <div class="w-400 mb-5">

            <TabbedContent
                :tab-items="[
                    {contentId: 'p-search-token', name: 'Search'},
                    {contentId: 'p-custom-token', name: 'Custom'}
                ]"
            >
                <div id="p-search-token" class="mt-1">
                    <ImportNFTBySearch />
                </div>
                <div id="p-custom-token">
                    <ImportNFTByContract />
                </div>
            </TabbedContent>
        </div>
    </WalletLayout>
</template>