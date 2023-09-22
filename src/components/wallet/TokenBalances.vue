<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens'

const props = defineProps({
    limit: { type: null, default: null }
})

const { tokensBalances } = useTokens()

onBeforeMount(() => {
  
})

</script>

<template>
    <ul class="list-group rounded">
        <template v-for="(item, index) in tokensBalances">
            <li class="list-group-item">And a fifth one</li>
        </template>
    </ul>
</template>