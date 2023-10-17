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
                :tabs="[
                    { id: 'import-nft-search', name: 'Search', component: ImportNFTBySearch },
                    { id: 'import-nft-custom', name: 'Custom', component: ImportNFTByContract }
                ]"
            />
        </div>
    </WalletLayout>
</template>