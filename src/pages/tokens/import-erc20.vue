<script setup>
import { ref } from 'vue';
import TabbedContent from '../../components/common/TabbedContent.vue';
import ImportERC20BySearch from '../../components/tokens/import-erc20/ImportERC20BySearch.vue';
import ImportERC20ByContract from '../../components/tokens/import-erc20/ImportERC20ByContract.vue';


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
                :tabs="[
                    { id: 'import-erc20-search',   component: ImportERC20BySearch, name: 'Search'},
                    { id: 'import-erc20-contract', component: ImportERC20ByContract, name: 'Custom'}
                ]"
            />
        </div>
    </WalletLayout>
</template>