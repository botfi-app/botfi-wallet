<script setup>
import { onBeforeMount, ref, watch } from 'vue';

const p = defineProps({
    params: { type: Array, default: [] }
})

const primaryType = ref("")
const contentObj = ref({})


const processData = async () => {
    
    let sigObj = p.params[1] || {}
    
    primaryType.value = sigObj.primaryType  || ""
    contentObj.value = sigObj.message || {}
}

onBeforeMount(() => {
 processData()
})

watch(p, () => {
    processData()
}, { deep: true })

</script>
<template>
    <div class="text-start my-2">
        <div class="fw-semibold">
            {{ primaryType }}
        </div>
        <div>
            <div>
                <div class="fs-14 fw-semibold mt-2">
                    From:
                </div>
                <template v-for="(value, name) in (contentObj.from || {})">
                    <div class="fs-12 fw-semibold d-flex text-capitalize my-1">
                        <div class="pe-4">{{ name }}</div>
                        <div class="text-break">{{ value  }}</div>
                    </div>
                </template>
            </div>
            <div>
                <div class="fs-14 fw-semibold mt-2">
                    To:
                </div>
                <template v-for="(value, name) in (contentObj.to || {})">
                    <div class="fs-12 fw-semibold d-flex text-capitalize my-1">
                        <div class="pe-4">{{ name }}</div>
                        <div class="text-break">{{ value  }}</div>
                    </div>
                </template>
            </div>
            <div>
                <div class="fs-14 fw-semibold mt-2">
                    Content:
                </div>
                <div class="fs-12 text-break">
                    {{ contentObj.contents || "" }}
                </div>
            </div>
        </div>
    </div>
</template>