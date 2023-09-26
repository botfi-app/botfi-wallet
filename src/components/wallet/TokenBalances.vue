<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useTokens } from '../../composables/useTokens'
import Image from '../common/Image.vue';
import { useSettings } from '../../composables/useSettings'

const props = defineProps({
    limit: { type: null, default: null },
    hasSearch: { type: Boolean, default: false }
})

const { fetchSettings } = useSettings()
const { getTokens, tokens } = useTokens()
const defaultCurrency = ref("usd")
const initialized = ref(false)
const tokensData = ref({})
const dataToRender  = ref({})


onBeforeMount(() => {
   initialize()
})

const initialize = async () => {
    let settings  = await fetchSettings()
    defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

    tokens.value = await getTokens()
    dataToRender.value = tokens.value

    initialized.value = true
}

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

watch(tokens, () => {
    console.log("tokens===>", tokens)
}, { deep: true })
</script>

<template>
    <div v-if="initialized">
        <div v-if="props.hasSearch">      
            <div class="h-divider mt-3" />
            <div class="px-3 pt-3">
                <search-form 
                    placeholder="Search"
                    @change="onSearch"
                    :dataToFilter="tokensData"
                    :filterKeys="['name', 'contract', 'symbol']"
                    :mode="{start: true, end: true }"
                />
            </div>
            <div class="h-divider my-3 mx-2" />
        </div>
        <div class="mx-2 px-1">
            <template v-for="token in dataToRender">
                <div class="d-flex justify-content-between align-items-center py-1 my-2">
                    <div class="d-flex">
                        <Image
                            :src="token.image"
                            :placeholder="token.symbol"
                            :width="28"
                            :height="28"
                            class="rounded-circle shadow"
                        />
                        <div class="ps-2">
                            <div class="fw-medium">{{ token.symbol.toUpperCase() }}</div>
                            <div class="fs-12 hint muted fw-semibold monospace">
                                {{ token.name }}
                            </div>
                        </div>
                    </div>
                    <div v-if="('balanceInfo' in  token)" 
                        class="d-flex flex-column align-items-end"
                    >
                        <div class="d-flex">
                            <div class="me-1">{{ token.balanceInfo.balanceDecimal }}</div>
                            <div>{{ token.symbol.toUpperCase() }}</div>
                        </div>
                        <div v-if="defaultCurrency in  token.balanceInfo.balanceFiat">
                            <div class="d-flex fs-12 hint muted fw-semibold monospace">
                                <div class="me-1">
                                    {{ token.balanceInfo.balanceFiat[defaultCurrency]  }}
                                </div>
                                <div>{{ defaultCurrency.toUpperCase() }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>