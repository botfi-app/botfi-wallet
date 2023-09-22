<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useTokens } from '../../composables/useTokens'
import Image from '../common/Image.vue';

const props = defineProps({
    limit: { type: null, default: null }
})

const { tokensBalances, getTokens } = useTokens()
const tokens = ref({})


onBeforeMount(() => {
   initialize()
})

const initialize = async () => {
    tokens.value = await getTokens()
    console.log("tokensObj.value===>", tokensObj.value)
}

</script>

<template>
    <template v-for="(item, index) in tokensBalances">
        <div class="d-flex my-4">
            <Image
                :src="tokens[item.token].image"
                :placeholder="tokens[item.token].symbol"
                :width="28"
                :height="28"
                class="rounded-circle shadow"
            />
        </div>
    </template>
</template>