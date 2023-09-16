<script setup>
import { ref } from 'vue';
import TabbedContent from '../../components/common/TabbedContent.vue';

</script>
<template>
    <WalletLayout
        title="Import Tokens"
        :show-nav="false"
    >   

        <NativeBackBtn />

        <div class="w-400 mb-5">
            <div class="d-flex p-2 px-3 align-items-center justify-content-between flex-nowrap">
                <div class="fw-semibold fs-6 pe-2">Import Token</div>
                <div class="ps-2">
                    <DefaultNetAndWallet 
                        :showAddr="false"
                        net-max-width="100px"
                    />
                </div>
            </div>
            <TabbedContent
                :tab-items="[
                    {contentId: 'p-search-token', name: 'Search'},
                    {contentId: 'p-custom-token', name: 'Custom Token'}
                ]"
            >
                <div id="p-search-token">
                    <ImportSearch />
                </div>
                <div id="p-custom-token">
                    <ImportCustom />
                </div>
            </TabbedContent>
        </div>
    </WalletLayout>
</template>