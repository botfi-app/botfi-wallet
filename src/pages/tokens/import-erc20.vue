<script setup>
import { ref } from 'vue';
import TabbedContent from '../../components/common/TabbedContent.vue';
import ImportERC20BySearch from '../../components/tokens/import-erc20/ImportERC20BySearch.vue';
import ImportCustom from '../../components/tokens/import-erc20/ImportERC20ByContract.vue';


</script>
<template>
    <WalletLayout
        title="Import Tokens"
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
                    <ImportERC20BySearch />
                </div>
                <div id="p-custom-token">
                    <ImportERC20ByContract />
                </div>
            </TabbedContent>
        </div>
    </WalletLayout>
</template>