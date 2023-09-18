<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens'

const props = defineProps({
    limit: { type: null, default: null }
})

const tokensCore = useTokens()
const tokensArr = ref([])

onBeforeMount(() => {
    fetchBalances()
})

const fetchBalances = async () => {
    
}
</script>

<template>

</template>