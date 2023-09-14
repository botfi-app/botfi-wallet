<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens'

const props = defineProps({
    limit: { type: Number, default: -1 }
})

const tokensCore = useTokens()
const tokensArr = ref([])

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
   tokensArr.value = tokensCore.getTokens(props.limit)
}
</script>

<template>

</template>