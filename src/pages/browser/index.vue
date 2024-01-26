<script setup>
import { onMounted, ref } from 'vue';
import InlineError from '../../components/common/InlineError.vue';


</script>
<template>
    <WalletLayout
        title="Browser"
        :show-nav="true"
        backUrl="/wallet"
        :has-footer="true"
    >   
        <div class=" center-vh pt-5 mt-5">
            <InlineError text="Coming Soon" :can-retry="false" />
        </div>
    </WalletLayout>
</template>