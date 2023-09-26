<script setup>
import { ref } from 'vue';
import TabbedContent from '../../components/common/TabbedContent.vue';

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
                    {contentId: 'p-custom-token', name: 'Custom Token'}
                ]"
            >
                <div id="p-search-token" class="mt-1">
                    <ImportSearch />
                </div>
                <div id="p-custom-token">
                    <ImportCustom />
                </div>
            </TabbedContent>
        </div>
    </WalletLayout>
</template>